import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateUserDTO{
    
   // @IsEnum({message: 'Tipo do usuário não está predefinido.'})
    @IsNotEmpty({message: 'Tipo do usuário não informado.'})
    userType:TipoUsuarioEnum;
    
    @IsString({message: 'NOME deve ser do tipo texto.'})
    @IsNotEmpty({message: 'NOME não pode ser vazio.'})
    @MinLength(5, {message:'NOME deve ter no mínimo 5 caracteres'})
    name: string;

    @IsEmail({allow_display_name: false }, { message: 'EMAIL inválido.'})
    @IsNotEmpty({message: 'EMAIL não pode ser vazio.'})
    email: string;

    @IsString({message: 'TELEFONE deve ser do tipo texto.'})
    @IsPhoneNumber('BR', {message: 'Número de telefone inválido.'})
    @IsOptional()
    phone: string;

    @IsString({message: 'SENHA deve ser do tipo texto.'})
    @IsNotEmpty({message: 'SENHA não pode ser vazia.'})
    password: string;

    @IsString({message: 'CONFIRMAÇÃO DE SENHA deve ser do tipo texto.'})
    @IsNotEmpty({message: 'CONFIRMAÇÃO DE SENHA não pode ser vazia.'})
    confirmPassword: string;

    @ValidateNested() 
    @Type(() => Object)
    person?: CriaPessoaDTO;

    @ValidateNested()
    @Type(() => Object)
    instituition?: CriaInstituicaoDTO;
    
}