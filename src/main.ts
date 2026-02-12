import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

declare global {
  interface Window {
    ui: any;
  }
}

async function bootstrap() {
  console.log('oi');
  
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
      'accessToken'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document, { 
    swaggerOptions:{
      persistAuthorization: true,
      responseInterceptor: (response) => {
        try{
          const url = response.url || '';

          if(url.endsWith('/auth/login')){
            const data = JSON.parse(response.text);
            const token = data.accessToken;
            
            // if(token && window.ui){
            //   window.ui.preauthorizeApiKey('accessToken', `Bearer ${token}`);
            //   console.log('Token aplicado automaticamente no Swagger.', `Bearer ${token}`, window.ui);
            // }

            if (token) {
              setTimeout(() => {
                if (window?.ui) {
                  window.ui.preauthorizeApiKey('accessToken', `Bearer ${token}`);
                  console.log('Token aplicado automaticamente.');
                } else {
                  console.warn('window.ui ainda não disponível.');
                }
              }, 500); // dá tempo do Swagger inicializar
            }
          }
          
        }catch(erro){
          console.error('Falha ao aplicar token automaticamente', erro)
        }
      }
    }
  }); 

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
