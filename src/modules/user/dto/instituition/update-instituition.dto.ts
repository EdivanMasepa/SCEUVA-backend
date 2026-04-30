import { IsDate, IsEnum, IsOptional, MaxDate } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SegmentEnum } from "../../../../shared/enums/segment.enum";

export class UpdateInstituitionDTO{

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate({message:"DATA DE FUNDAÇÃO tem tipo inválido."})
    @MaxDate(new Date())
    @Type(() => Date)
    foundationDate?: Date;

    @ApiPropertyOptional({ enum: SegmentEnum, description: 'Segmento da instituição.' })
    @IsOptional()
    @IsEnum(SegmentEnum, {message:"SEGMENTO não está predefinido."})
    segment?: SegmentEnum;
}