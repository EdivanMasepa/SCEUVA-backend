import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, MaxDate, Min, MinDate, isNotEmpty } from "class-validator";
import { SegmentEnum } from "src/shared/enums/segment.enum";

export class CreateInstituitionDTO {

    @IsString({message: "CNPJ tem tipo inválido."})
    @IsNotEmpty({message: "CNPJ não pode ser vazio."})
    cnpj: string;
    
    @IsDate({message:"DATA DE FUNDAÇÃO tem tipo inválido."})
    @MaxDate(new Date())
    @IsNotEmpty({message: "DATA DE FUNDAÇÃO não pode ser vazia."})
    foundationDate: Date;

    @IsEnum(SegmentEnum, {message:"SEGMENTO não está predefinido."})
    @IsNotEmpty({message: "SEGMENTO não pode ser vazio."})
    segment?: SegmentEnum

}