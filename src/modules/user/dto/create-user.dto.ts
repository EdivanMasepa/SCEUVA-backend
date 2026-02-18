import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserTypeEnum } from "src/shared/enums/user-type.enums";
import { CreatePersonDTO } from "./person/create-person.dto";
import { CreateInstituitionDTO } from "./instituition/create-instituition.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDTO{
    
    @ApiProperty({ enum: UserTypeEnum, description: 'Tipo do usuário.' })
    @IsEnum(UserTypeEnum, {message: 'Tipo do usuário não está predefinido.'})
    @IsNotEmpty({message: 'Tipo do usuário não informado.'})
    userType:UserTypeEnum;
    
    @ApiProperty()
    @IsString({message: 'NOME deve ser do tipo texto.'})
    @IsNotEmpty({message: 'NOME não pode ser vazio.'})
    @MinLength(5, {message:'NOME deve ter no mínimo 5 caracteres'})
    name: string;

    @ApiProperty()
    @IsEmail({allow_display_name: false }, { message: 'EMAIL inválido.'})
    @IsNotEmpty({message: 'EMAIL não pode ser vazio.'})
    email: string;

    @ApiProperty()
    @IsString({message: 'TELEFONE deve ser do tipo texto.'})
    @IsPhoneNumber('BR', {message: 'Número de telefone inválido.'})
    @IsOptional()
    phone: string;

    @ApiProperty()
    @IsString({message: 'SENHA deve ser do tipo texto.'})
    @IsNotEmpty({message: 'SENHA não pode ser vazia.'})
    password: string;

    @ApiProperty()
    @IsString({message: 'CONFIRMAÇÃO DE SENHA deve ser do tipo texto.'})
    @IsNotEmpty({message: 'CONFIRMAÇÃO DE SENHA não pode ser vazia.'})
    confirmPassword: string;

    @ApiPropertyOptional()
    @ValidateNested() 
    @Type(() => CreatePersonDTO)
    person?: CreatePersonDTO;

    @ApiPropertyOptional()
    @ValidateNested()
    @Type(() => CreateInstituitionDTO)
    instituition?: CreateInstituitionDTO;
    
}