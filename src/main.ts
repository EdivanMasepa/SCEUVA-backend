import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

declare global {
  interface Window {
    ui: any;
  }
}

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

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
      'acessToken'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document, {
    swaggerOptions:{
      persistAuthorization: true,
      requestInterceptor: (req) => {
        if(req.url.endsWith('/auth/login') && req.method === 'POST')
          req.onSucess = (response) => {
            try{
              const data = JSON.parse(response.text);
              const token = data.acessToken;

              if(token)
                window.ui.preauthorizeApiKey('acessToken', 'Bearer' + token)
            }catch(erro){
              console.error('Falha ao aplicar token automaticamente', erro)
            }
          };
          return req;
      }
    }
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
