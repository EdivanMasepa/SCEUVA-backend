import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';


@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ){}

  async validateLoginUser(login: string, password: string){
    try {
      const user = await this.userService.findByIdentifier(login);
      const match = user ? await bcrypt.compare(password, user.password) : null;
      
      if(!user || match == null) 
        throw new BadRequestException('Credenciais inválidas.');

      const {password: _p, ...rest } = user as any; 
      return rest;

    } catch (erro) {
      if(erro instanceof BadRequestException)
        throw erro

      throw new InternalServerErrorException('Erro interno, verifique os dados e tente novamente.')
    }
  }

  async getTokens(payload: {sub: number; login: string}){
    try {
      const accessToken = await this.jwtService.signAsync(
        {sub: payload.sub, login: payload.login},
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN')
        }
      )
      
      const refreshToken = await this.jwtService.signAsync(
        {sub: payload.sub, login: payload.login},
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        }
      )

      return {accessToken, refreshToken};
    } catch (erro) {
      throw new InternalServerErrorException('Erro ao gerar tokens de autenticação.')
    }
  }

  async login(loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string}>{
    try {
      const user = await this.validateLoginUser(loginDto.login, loginDto.password);
      const tokens = await this.getTokens({sub: user.id, login: user.login});
      
      if(!tokens) 
        throw new BadRequestException('Falha ao gerar tokens de autenticação.');
      
      const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);
      await this.userService.setRefreshToken(hashedRefresh, user.id);

      return tokens;

    } catch (erro) {
      if(erro instanceof BadRequestException)
        throw erro

      throw new InternalServerErrorException('Erro interno, verifique os dados e tente novamente.')
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

      const tokens = await this.getTokens({sub: user.id, login: user.email});
      const hashed = await bcrypt.hash(tokens.refreshToken, 10);

      await this.userService.setRefreshToken(hashed, user.id);

      return tokens;
    } catch (erro) {      
      if (erro instanceof HttpException) 
        throw erro;

      throw new InternalServerErrorException('Erro ao atualizar token.'); 
    }
  }

  async logout(userId: number){
    await this.userService.removeRefreshToken(userId);
  }
}
