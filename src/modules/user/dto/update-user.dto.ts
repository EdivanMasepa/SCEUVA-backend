import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from 'class-validator';
import { UpdatePersonDTO } from './person/update-person.dto';
import { UpdateInstituitionDTO } from './instituition/update-instituition.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDTO{
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsString({message:'NOME deve ser do tipo texto.'})
    @MinLength(5, {message:'NOME deve ter no mínimo 5 caracteres'})
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail({allow_display_name:false}, {message:'EMAIL inválido.'})
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({message:'TELEFONE tem tipo inválido.'})
    @IsPhoneNumber('BR', {message: 'Telefone inválido. Informe um número de telefone nacional.'})
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested() 
    @Type(() => UpdatePersonDTO)
    person?: UpdatePersonDTO;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateInstituitionDTO)
    instituition?: UpdateInstituitionDTO;
}
