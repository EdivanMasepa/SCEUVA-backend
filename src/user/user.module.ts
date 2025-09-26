import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PersonEntity } from './entities/person.entity';
import { InstituitionEntity } from './entities/instituition.entity';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity, PersonEntity, InstituitionEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
