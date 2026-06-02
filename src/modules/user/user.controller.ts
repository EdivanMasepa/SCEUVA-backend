import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ListUserDTO } from './dto/list-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponses } from '../../shared/swagger.decorators';
import { VerifyEmailDTO } from './dto/verify-email.dto';
import type { Request as ExpressRequest } from 'express';
import { RemoveAccountDTO } from './dto/remove-account.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiResponses([
    { status: 201, description: 'Usuário cadastrado com sucesso.'},
    { status: 400, description: 'Erro de validação, verifique os dados e tente novamente.'},
    { status: 500, description: 'Erro interno. Verifique os dados e tente novamente.'}
  ])
  create(@Body() createUserDto: CreateUserDTO) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([{status: 200, type: ListUserDTO}])
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([{status: 200, type: ListUserDTO}])
  findOne(@Param('id') id: string) { console.log
    return this.userService.findOne(+id);
  }

  @Patch()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([{status: 200, description: 'Atualizado com sucesso.'}])
  update(@Request() req, @Body() updateUserDto: UpdateUserDTO) {console.log(req.user.id)
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([{status: 200, description: 'Cadastro excluído com sucesso.'}])
  remove(@Request() req, @Body() password: RemoveAccountDTO) {
    return this.userService.remove(req.user.id, password.password);
  }

  @Post('verify-email')
  @ApiBearerAuth()
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDTO) {
    return this.userService.verifyEmail(verifyEmailDto.email, verifyEmailDto.code);
  }

  @Post('resend-verification-email')
  @ApiBearerAuth()
  resendVerificationEmail(@Body('email') email: string) {
    return this.userService.resendVerificationEmail(email);
  }

  @Post('change-password')
  @ApiBearerAuth()
  changePassword(@Request() req, @Body() changePassword: ChangePasswordDTO) {
    return this.userService.changePassword(req.user.id, changePassword);
  }


}
