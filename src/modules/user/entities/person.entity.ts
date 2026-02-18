import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { GenderEnum } from "../../../shared/enums/gender.enum";
import { RiskLevelEnum } from "../../../shared/enums/risk-level.enum";
import { UserEntity } from "./user.entity";

@Entity({name:'pessoa'})
export class PersonEntity{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({name: 'cpf', type: 'varchar', nullable:false})
    cpf: string;  

    @Column({name: 'data_nascimento', type: 'date', nullable:false})
    birthDate: Date;

    @Column({name: 'genero', type: 'enum', enum: GenderEnum, nullable:false})
    gender: GenderEnum;

    @Column({name: 'situacao', type: 'enum', enum: RiskLevelEnum, nullable:false})
    riskLevel: RiskLevelEnum;
    
    @OneToOne(() => UserEntity, user => user.person, {nullable:false, onUpdate:'CASCADE', onDelete:'CASCADE', cascade:true})
    @JoinColumn({name:'id_usuario'})
    user: UserEntity;
}