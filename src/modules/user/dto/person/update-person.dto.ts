import { IsDate, IsEnum, IsOptional, MaxDate, MinDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GenderEnum } from '../../../../shared/enums/gender.enum';
import { RiskLevelEnum } from '../../../../shared/enums/risk-level.enum';

export class UpdatePersonDTO{

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Date)
    @IsDate({message:"DATA DE NASCIMENTO tem tipo inválido."})    
    @MinDate(new Date('1925-01-01'), { message: 'DATA DE NASCIMENTO muito antiga, verifique.' })
    @MaxDate(new Date('2020-01-01'), { message: 'DATA DE NASCIMENTO muito recente, verifique.' })
    birthDate?: Date;

    @ApiPropertyOptional({ enum: GenderEnum, description: 'Gênero da pessoa.' })
    @IsOptional()
    @IsEnum(GenderEnum, {message:"GÊNERO não está predefinido."})
    gender?: GenderEnum;

    @ApiPropertyOptional({ enum: RiskLevelEnum, description: 'Nível de risco em que a pessoa está.' })
    @IsOptional()
    @IsEnum(RiskLevelEnum, {message:"NÍVEL DE RISCO não está predefinido."})
    riskLevel?: RiskLevelEnum;
}
