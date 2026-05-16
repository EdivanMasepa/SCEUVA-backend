import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailDTO {
    @ApiProperty()
    @IsEmail({allow_display_name: false }, { message: 'EMAIL inválido.'})
    @IsNotEmpty({message: 'EMAIL não pode ser vazio.'})
    email: string;

    @ApiProperty()
    @IsNotEmpty({message: 'CÓDIGO não pode ser vazio.'})
    code: string;
}