import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { Request } from 'express';
import { UserService } from '../../user/user.service';
import { EmailVerificationService } from './email-verification.service';
import { UserEntity } from '../../user/entities/user.entity';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { VerificationService } from '../verification/verification.service';
import { UpdateUserDTO } from '../../user/dto/update-user.dto';
import { ChangePasswordDTO } from '../../user/dto/change-password.dto';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly verificationService: VerificationService
  ){}

  async validateLoginUser(login: string, password: string){
    try {
      const user = await this.userService.findByIdentifier(login);
      const match = user ? await bcrypt.compare(password, user.password) : null;
      
      if(!user || !match || match == null) 
        throw new BadRequestException('Credenciais inválidas.');

      const {password: _p, ...rest } = user as any; 
      return rest;

    } catch (erro) {
      console.log(erro);
      
      if(erro instanceof BadRequestException)
        throw erro

      throw new InternalServerErrorException('Erro interno, verifique os dados e tente novamente.')
    }
  }

  async login(loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string}>{
    try {
      const user = await this.validateLoginUser(loginDto.login, loginDto.password);
      const tokens = await this.getTokens({sub: user.id});
      
      if(!tokens) 
        throw new BadRequestException('Falha ao gerar tokens de autenticação.');
      
      const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);
      await this.userService.setRefreshToken(hashedRefresh, user.id);

      return tokens;

    } catch (erro) {
      console.log(erro);
      
      if(erro instanceof BadRequestException)
        throw erro

      throw new InternalServerErrorException('Erro interno, verifique os dados e tente novamente.')
    }
  }

  async getTokens(payload: {sub: number}){
    try {
      const accessToken = await this.jwtService.signAsync(
        {sub: payload.sub},
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN')
        }
      )
      
      const refreshToken = await this.jwtService.signAsync(
        {sub: payload.sub},
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        }
      )

      return {accessToken, refreshToken};
    } catch (erro) {
      console.log(erro);
      
      throw new InternalServerErrorException('Erro ao gerar tokens de autenticação.')
    }
  }

  async refreshTokens(req: Request){
    try {
      const refreshToken = req.cookies?.refreshToken || (req.body && req.body.refreshToken); 
      if (!refreshToken) 
        throw new BadRequestException('Refresh token não informado.');

      const payload: any = this.jwtService.decode(refreshToken);
      if (!payload?.sub)
        throw new ForbiddenException('Token inválido.');

      const user = await this.userService.findByIdentifier(payload.sub);
      if(!user || !user.hashedRefreshToken) 
        throw new ForbiddenException('Acesso não autorizado.');
      
      const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
      if(!isMatch) 
        throw new ForbiddenException('Acesso não autorizado.');

      const tokens = await this.getTokens({sub: user.id});
      const hashed = await bcrypt.hash(tokens.refreshToken, 10);

      await this.userService.setRefreshToken(hashed, user.id);

      return tokens;
    } catch (erro) {   
      console.log(erro);
         
      if (erro instanceof HttpException) 
        throw erro;

      throw new InternalServerErrorException('Erro ao atualizar token.'); 
    }
  }

  async logout(userId: number){
    try {
      if(!userId)
        throw new UnauthorizedException('Usuário não autenticado.');
      
      await this.userService.removeRefreshToken(userId);
      
    } catch (erro) {
      console.log(erro);
      
      if(erro instanceof UnauthorizedException)
        throw erro;

      throw new InternalServerErrorException('Erro ao remover token.')
    }
  }

  async verifyEmailAndLogin(email: string, code: string): Promise<{accessToken: string, refreshToken: string}>{
    const user = await this.userService.findByIdentifier(email, false);
    
    if(!user)
      throw new NotFoundException('Usuário não encontrado.')
    
    await this.emailVerificationService.verifyEmail(email, code);

    const tokens = await this.getTokens({sub: user.id});
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);

    await this.userService.setRefreshToken(hashedRefresh, user.id);

    return tokens;
  }

  async forgotPassword(forgotPasswordDTO: ForgotPasswordDTO){
    const user = await this.userService.findByIdentifier(forgotPasswordDTO.email, false);

    if(!user)
      throw new NotFoundException('Usuário não encontrado.');

    const isValid = await this.verificationService.validate(forgotPasswordDTO.email, forgotPasswordDTO.code);

    if(!isValid)
      throw new BadRequestException('Código de verificação inválido.');

    const userUpdated: ChangePasswordDTO = {
      currentPassword: user.password,
      newPassword: forgotPasswordDTO.newPassowrd,
      confirmNewPassword: forgotPasswordDTO.confirmNewPassword
    };

    await this.userService.changePassword(user.id, userUpdated);
  }
}
