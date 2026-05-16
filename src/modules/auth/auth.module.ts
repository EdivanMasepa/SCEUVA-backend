import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { EmailVerificationService } from './services/email-verification.service';
import { MailModule } from '../mail/mail.module';
import { MemoryVerificationStorageService } from './verification/memory-verification-storage.service';
import { VerificationService } from './verification/verification.service';
import { VerificationStorage } from './verification/verification-storage.abstract';

@Module({
  imports:[
    forwardRef(() => UserModule), MailModule,
    PassportModule.register({defaultStrategy: 'jwt'}), 
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {expiresIn: configService.get<string>('JWT_EXPIRES_IN')}
      })
  })],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EmailVerificationService,
    MemoryVerificationStorageService,
    VerificationService, 
    {
         provide: VerificationStorage,
         useClass: MemoryVerificationStorageService,
      },
  ],
  exports: [AuthService, JwtStrategy, EmailVerificationService, MemoryVerificationStorageService, VerificationService, VerificationStorage]
})
export class AuthModule {}
