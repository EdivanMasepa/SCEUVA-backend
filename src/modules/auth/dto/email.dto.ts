import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, } from "class-validator";

export class EmailDTO {
    @ApiProperty()
    @IsEmail({allow_display_name: false }, { message: 'EMAIL inválido.'})
    @IsNotEmpty({message: 'EMAIL não pode ser vazio.'})
    email: string;
}