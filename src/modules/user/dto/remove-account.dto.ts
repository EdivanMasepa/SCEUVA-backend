import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RemoveAccountDTO {

    @ApiProperty()
    @IsNotEmpty({message: 'SENHA  é obrigatória.'})
    @IsString({message: 'SENHA deve ser do tipo texto.'})
    password: string;

}