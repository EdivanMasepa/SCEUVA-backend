import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ChangePasswordDTO {

    @ApiProperty()
    @IsNotEmpty({message: 'SENHA ATUAL é obrigatória.'})
    @IsString({message: 'SENHA ATUAL deve ser do tipo texto.'})
    currentPassword: string;

    @ApiProperty()
    @IsNotEmpty({message: 'NOVA SENHA é obrigatória.'})
    @IsString({message: 'NOVA SENHA deve ser do tipo texto.'})
    newPassowrd: string;

    @ApiProperty()
    @IsNotEmpty({message: 'CONFIRMAÇÃO DE SENHA é obrigatória.'})
    @IsString({message: 'CONFIRMAÇÃO DE SENHA deve ser do tipo texto.'})
    confirmNewPassword: string;
}