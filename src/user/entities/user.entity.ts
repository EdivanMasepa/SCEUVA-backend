import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserTypeEnum } from "../../shared/enums/user-type.enums";
import { PersonEntity } from "./person.entity";
import { InstituitionEntity } from "./instituition.entity";

@Entity({name:'usuario'})
export class UserEntity {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({name:'tipo_usuario', type: 'enum', enum: UserTypeEnum, nullable:false})
    typeUser:UserTypeEnum;
    
    @Column({name: 'nome', type: 'varchar', nullable:false})
    name: string;

    @Column({name: 'email', type: 'varchar', nullable:false})
    email: string;

    @Column({name: 'telefone', type: 'varchar', nullable:true})
    phone: string;

    @Column({name: 'senha', type: 'varchar', nullable:false})
    password: string;

    @Column({name: 'moderador', type: 'boolean', default: false})
    moderator: boolean;

    @OneToOne(() => PersonEntity, person => person.user, {nullable:true, eager: true})
    person: PersonEntity;

    @OneToOne(() => InstituitionEntity, instituition => instituition.user, {nullable:true, eager: true})
    instituition: InstituitionEntity;
}