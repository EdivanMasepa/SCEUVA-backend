import { Controller, Post, Body, Res, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request, Response} from 'express';
import { ApiResponses } from 'src/shared/swagger.decorators';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponses([
    { status: 200, description: 'acessToken: string.'},
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
    });
     return {accessToken: tokens.accessToken};
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([
    { status: 200, description: 'accessToken: string'},
    { status: 400, description: 'Refresh token não informado.' },
    { status: 403, description: 'Token inválido.' },
    { status: 403, description: 'Acesso não autorizado.' },
    { status: 500, description: 'Erro ao gerar tokens de autenticação.' },
    { status: 500, description: 'Erro ao atualizar token.' }
  ])
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

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
   @ApiResponses([
    { status: 200, description: 'Logout realizado com sucesso.'},
    { status: 401, description: 'Usuário não autenticado.' },
    { status: 500, description: 'Erro ao remover token.' }
  ])
  async logout(@Req() req: Request, @Res({passthrough: true}) res: Response){
    const userId = (req as any).user?.id;
    await this.authService.logout(userId);

    res.clearCookie(
      'refreshToken',
      {httpOnly: true, secure: true, sameSite: 'strict',}
    );
    return { status: 'success', message: 'Logout realizado com sucesso.' }
  }
}
