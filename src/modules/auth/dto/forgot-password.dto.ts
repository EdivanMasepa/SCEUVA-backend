import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ForgotPasswordDTO {
    @ApiProperty()
    @IsEmail({allow_display_name: false }, { message: 'EMAIL inválido.'})
    @IsNotEmpty({message: 'EMAIL não pode ser vazio.'})
    email: string;

    @ApiPropertyOptional()
    @IsString({message: 'CODIGO deve ser do tipo texto.'})
    @IsInt({message: 'CODIGO deve ser um número inteiro.'})
    @IsOptional()
    code: string;

    @ApiProperty()
    @IsNotEmpty({message: 'NOVA SENHA é obrigatória.'})
    @IsString({message: 'NOVA SENHA deve ser do tipo texto.'})
    newPassowrd: string;

    @ApiProperty()
    @IsNotEmpty({message: 'CONFIRMAÇÃO DE SENHA é obrigatória.'})
    @IsString({message: 'CONFIRMAÇÃO DE SENHA deve ser do tipo texto.'})
    confirmNewPassword: string;
}