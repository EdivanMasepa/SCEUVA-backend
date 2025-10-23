import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ListUserDTO } from './dto/list-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponses } from 'src/shared/swagger.decorators';

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
  @UseGuards(AuthGuard('jwt'))
  @ApiResponses([{status: 200, type: ListUserDTO}])
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findByIdentifier(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
