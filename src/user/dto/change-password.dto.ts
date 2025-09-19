import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ChangePasswordDTO {

    @IsNumber({allowNaN: false}, {message: 'CODIGO deve ser um número.'})
    @IsInt({message: 'CODIGO deve ser um número inteiro.'})
    @IsOptional()
    code?: number;

    @IsNotEmpty({message: 'SENHA ATUAL é obrigatória.'})
    @IsString({message: 'SENHA ATUAL deve ser do tipo texto.'})
    currentPassword: string;

    @IsNotEmpty({message: 'NOVA SENHA é obrigatória.'})
    @IsString({message: 'NOVA SENHA deve ser do tipo texto.'})
    newPassowrd: string;

    @IsNotEmpty({message: 'CONFIRMAÇÃO DE SENHA é obrigatória.'})
    @IsString({message: 'CONFIRMAÇÃO DE SENHA deve ser do tipo texto.'})
    ConfirmNewPassword: string;
}