import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {

    @ApiProperty()
    @IsString({message: "Tipagem inválida para login."})
    @IsNotEmpty({message: "Login não informado."})
    login: string;

    @ApiProperty()
    @IsString({message: "Tipagem inválida para senha."})
    @IsNotEmpty({message: "Senha não informada."})
    password: string;
}