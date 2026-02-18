import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SegmentEnum } from "../../../shared/enums/segment.enum";
import { UserEntity } from "./user.entity";

@Entity({name:'instituicao'})
export class InstituitionEntity{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({name: 'cnpj', type: 'varchar', nullable:false})
    cnpj: string;

    @Column({name: 'data_fundacao', type: 'timestamp', nullable:false})
    foundationDate: Date;

    @Column({name: 'segmento', type: 'enum', enum: SegmentEnum, nullable:false})
    segment: SegmentEnum;

    @OneToOne(() => UserEntity, user => user.instituition, {nullable:false, onUpdate:'CASCADE', onDelete:'CASCADE', cascade:true})
    @JoinColumn({name:'id_usuario'})
    user: UserEntity;
}