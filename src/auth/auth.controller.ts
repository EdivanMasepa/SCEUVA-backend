import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiResponse } from '@nestjs/swagger';
import express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiResponse({status: 200, description: 'acessToken: string, refreshToken: string.'})
  @ApiBadRequestResponse({ description: 'Credenciais inválidas.'})
  @ApiBadRequestResponse({ description: 'Falha ao gerar tokensd e autenticação.'})
  @ApiInternalServerErrorResponse({ description: 'Erro interno. Verifique os dados e tente novamente.'})
  @ApiInternalServerErrorResponse({ description: 'Erro ao gerar tokens de autenticação.'})
  async login(@Body() loginDto: LoginDto, @Res({passthrough: true}) res: express.Response): Promise<{accessToken: string}> {
    const tokens = await this.authService.login(loginDto);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:  7 * 24 * 60 * 60 * 1000
    }) 
     return {accessToken: tokens.accessToken};
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
