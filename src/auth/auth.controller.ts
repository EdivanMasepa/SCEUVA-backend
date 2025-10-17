import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request, Response} from 'express';
import { ApiResponses } from 'src/shared/swagger.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponses([
    { status: 200, description: 'acessToken: string, refreshToken: string.'},
    { status: 400, description: 'Credenciais inválidas.'},
    { status: 400, description: 'Falha ao gerar tokensd e autenticação.'},
    { status: 500, description: 'Erro interno. Verifique os dados e tente novamente.'},
    { status: 500, description: 'Erro ao gerar tokens de autenticação.'}
  ])
  async login(@Body() loginDto: LoginDto, @Res({passthrough: true}) res: Response): Promise<{accessToken: string}> {
    const tokens = await this.authService.login(loginDto);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:  7 * 24 * 60 * 60 * 1000
    }) ;
     return {accessToken: tokens.accessToken};
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const tokens = await this.authService.refreshTokens(req);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    return { accessToken: tokens.accessToken };
  }
}
