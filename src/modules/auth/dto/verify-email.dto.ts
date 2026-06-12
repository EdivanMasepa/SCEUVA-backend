import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, } from "class-validator";
import { EmailDTO } from "./email.dto";

export class VerifyEmailDTO  extends EmailDTO{
    @ApiProperty()
    @IsNotEmpty({message: 'CÓDIGO não pode ser vazio.'})
    code: string;
}