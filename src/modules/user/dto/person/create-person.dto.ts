import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, MaxDate, Min, MinDate, isNotEmpty } from "class-validator";
import { GenderEnum } from "src/shared/enums/gender.enum";
import { RiskLevelEnum } from "src/shared/enums/risk-level.enum";

export class CreatePersonDTO {
  
    @ApiProperty()
    @IsString({message: "CPF tem tipo inválido."})
    @IsNotEmpty({ message: "CPF não pode ser vazio."})
    cpf: string;
  
    @ApiProperty()
    @IsDate({message:"DATA DE NASCIMENTO tem tipo inválido."})
    @IsNotEmpty({message: "DATA DE NASCIMENTO não pode ser vazia"})
    @MinDate(new Date('1925-01-01'), { message: 'DATA muito antiga, verifique.' })
    @MaxDate(new Date('2020-01-01'), { message: 'DATA muito recente, verifique.' })
    @Type(() => Date)
    birthDate: Date;

    @ApiProperty({ enum: GenderEnum, description: 'Gênero da pessoa.' })
    @IsEnum(GenderEnum, {message:"GÊNERO não está predefinido."})
    @IsNotEmpty({ message: "GÊNERO não pode ser vazio."})
    gender: GenderEnum;

    @ApiProperty({ enum: RiskLevelEnum, description: 'Nível de risco em que a pessoa está.' })
    @IsEnum(RiskLevelEnum, {message:"SITUAÇÃO não está predefinida."})
    @IsNotEmpty({ message: "SITUAÇÃO não pode ser vazia."})
    riskLevel: RiskLevelEnum;
}