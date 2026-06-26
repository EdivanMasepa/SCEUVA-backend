import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ListUserDTO } from './dto/list-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponses } from '../../shared/swagger.decorators';
import { RemoveAccountDTO } from './dto/remove-account.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { VerifyEmailDTO } from '../auth/dto/verify-email.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiResponses([
    {status: 201, description: 'Usuário cadastrado com sucesso.'},
    {status: 400, description: 'E-mail já cadastrado..'},
    {status: 400, description: 'Número de telefone já cadastrado..'},
    {status: 400, description: 'As senhas não conferem.'},
    {status: 400, description: 'CPF inválido.'},
    {status: 400, description: 'CPF já cadastrado.'},
    {status: 400, description: 'CNPJ inválido.'},
    {status: 400, description: 'CNPJ já cadastrado.'},
    {status: 400, description: 'Tipo de usuário inválido.'},
    {status: 500, description: 'Erro interno. Verifique os dados e tente novamente.'}
  ])
  create(@Body() createUserDto: CreateUserDTO) {
    return this.userService.create(createUserDto);
  }
  
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([
    {status: 200, type: ListUserDTO},
    {status: 400, description: 'Usuário não encontrado.'},
    {status: 500, description: 'Erro interno. Verifique os dados e tente novamente.'}
  ])
  findOne(@Param('id') id: string) { console.log
    return this.userService.findOne(+id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([
    {status: 200, type: [ListUserDTO]},
    {status: 500, description: 'Erro interno. Verifique os dados e tente novamente.'}
  ])
  findAll() {
    return this.userService.findAll();
  }

  @Patch()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([
    {status: 200, description: 'Atualizado com sucesso.'},
    {status: 400, description: 'E-mail já cadastrado.'},
    {status: 400, description: 'Número de telefone já cadastrado.'},
    {status: 400, description: 'Usuário não possui cadastro de pessoa.'},
    {status: 400, description: 'Usuário não possui cadastro de instituição.'},
    {status: 401, description: 'Usuário não autorizado.'},
    {status: 404, description: 'Usuário inválido.'},
    {status: 500, description: 'Erro ao atualizar dados. Verifique os dados e tente novamente.'}
  ])
  update(@Request() req, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(req.user.id, updateUserDto);
  }
  
  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([
    {status: 200, description: 'Senha atualizada com sucesso.'},
    {status: 400, description: 'Senha atual incorreta.'},
    {status: 400, description: 'As senhas não conferem.'},
    {status: 400, description: 'A nova senha não pode ser igual à senha atual.'},
    {status: 401, description: 'Usuário não autorizado.'},
    {status: 404, description: 'Usuário inválido.'},
    {status: 500, description: 'Erro ao atualizar senha. Verifique os dados e tente novamente.'}
  ])
  changePassword(@Request() req, @Body() changePassword: ChangePasswordDTO) {
    return this.userService.changePassword(req.user.id, changePassword);
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([
    {status: 200, description: 'Cadastro excluído com sucesso.'},
    {status: 400, description: 'Senha não informada.'},
    {status: 400, description: 'Senha inválida.'},
    {status: 401, description: 'Usuário não autorizado.'},
    {status: 404, description: 'Usuário inválido.'},
    {status: 500, description: 'Erro ao excluir conta. Tente novamente.'},
  ])
  remove(@Request() req, @Body() password: RemoveAccountDTO) {
    return this.userService.remove(req.user.id, password.password);
  }
}
