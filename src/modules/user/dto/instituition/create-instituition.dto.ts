import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxDate, Min, MinDate, isNotEmpty } from "class-validator";
import { SegmentEnum } from "src/shared/enums/segment.enum";

export class CreateInstituitionDTO {

    @ApiProperty()
    @IsString({message: "CNPJ tem tipo inválido."})
    @IsNotEmpty({message: "CNPJ não pode ser vazio."})
    cnpj: string;

    @ApiProperty()
    @IsDate({message:"DATA DE FUNDAÇÃO tem tipo inválido."})
    @MaxDate(new Date())
    @IsNotEmpty({message: "DATA DE FUNDAÇÃO não pode ser vazia."})
    @Type(() => Date)
    foundationDate: Date;

    @ApiPropertyOptional({ enum: SegmentEnum, description: 'Segmento da instituição.' })
    @IsEnum(SegmentEnum, {message:"SEGMENTO não está predefinido."})
    @IsOptional()
    segment?: SegmentEnum
}