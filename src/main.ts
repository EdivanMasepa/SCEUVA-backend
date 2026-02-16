import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function setupSwagger(app: any) {
  const config = new DocumentBuilder()
    .setTitle('SCEUVA')
    .setDescription('Documentação Back-End do sistema de Comunicação Sobre Enchente em União da Vitória.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'jwt',
        in: 'header',
        name: 'Authorization'
      },
      'accessToken'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: false,
      requestInterceptor: (req) => {
        try {
          const token = (typeof window !== 'undefined' && window.localStorage)
            ? window.localStorage.getItem('sceuva_access_token') || (window as any).__SWAGGER_ACCESS_TOKEN
            : (window as any)?.__SWAGGER_ACCESS_TOKEN;

          if (token) {
            if (!req.headers) req.headers = {};
            if (!req.headers.Authorization && !req.headers.authorization) {
              req.headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch (e) {
          console.warn('Não foi possível acessar token no localStorage', e);
        }

        return req;
      },
      responseInterceptor: (response) => {
        try {
          const url = response.url || '';

          if (url.endsWith('/auth/login')) {
            let data: any = undefined;
            const text = response.text ?? (response.body && typeof response.body === 'string' ? response.body : undefined);

            if (text) {
              try {
                data = JSON.parse(text);
              } catch (e) {
                data = response.body;
              }
            } else {
              data = response.body;
            }

            const token = data?.accessToken;

            if (token) {
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem('sceuva_access_token', token);
                } else {
                  (window as any).__SWAGGER_ACCESS_TOKEN = token;
                }
              } catch (e) {
                console.warn('Não foi possível salvar token no localStorage', e);
              }
              
              const tryApply = () => {
                try {
                  const ui: any = (typeof window !== 'undefined' && (window as any).ui) ? (window as any).ui : null;
                  if (ui && typeof ui.preauthorizeApiKey === 'function') {
                    ui.preauthorizeApiKey('accessToken', `Bearer ${token}`);
                    console.log('Token aplicado automaticamente.');
                    return true;
                  }
                } catch (e) {
                  console.warn('Erro ao aplicar token no Swagger UI', e);
                }
                return false;
              };

              let attempt = 0;
              const maxAttempts = 6; 

              const attemptApply = () => {
                attempt++;
                const ok = tryApply();
                if (ok) return;
                if (attempt < maxAttempts) {
                  const delay = Math.pow(2, attempt - 1) * 200;
                  setTimeout(attemptApply, delay);
                } else {
                  console.warn('Não foi possível aplicar token no Swagger UI após tentativas.');
                }
              };

              attemptApply();
            }
          }
        } catch (erro) {
          console.error('Falha ao aplicar token automaticamente', erro);
        }
      },
    },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
