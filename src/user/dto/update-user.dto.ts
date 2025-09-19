import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from 'class-validator';

export class UpdateUserDTO{
    
    @IsOptional()
    @IsString({message:'NOME deve ser do tipo texto.'})
    @MinLength(5, {message:'NOME deve ter no mínimo 5 caracteres'})
    name?: string;

    @IsOptional()
    @IsEmail({allow_display_name:false}, {message:'EMAIL inválido.'})
    email?: string;

    @IsOptional()
    @IsString({message:'TELEFONE tem tipo inválido.'})
    @IsPhoneNumber('BR', {message: 'Número de telefone inválido.'})
    phone?: string;

    @ValidateNested() 
    @Type(() => AtualizaPessoaDTO)
    person?: AtualizaPessoaDTO;

    @ValidateNested()
    @Type(() => AtualizaInstituicaoDTO)
    instituition?: AtualizaInstituicaoDTO;
}
