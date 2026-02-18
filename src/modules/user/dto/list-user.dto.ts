import { Expose, Type } from "class-transformer";
import { ListInstituitionDTO } from "./instituition/list-instituition.dto";
import { ListPersonDTO } from "./person/list-person.dto";

export class ListUserDTO{
    @Expose()
    private readonly id:number;

    @Expose()
    private readonly userType:string;

    @Expose()
    private readonly name:string;

    @Expose()
    private readonly email:string;

    @Expose()
    private readonly phone:string;

    @Expose()
    private readonly moderator:boolean;

    @Expose()
    @Type(() => ListPersonDTO)
    private readonly person?: ListPersonDTO;

    @Expose()
    @Type(() => ListInstituitionDTO)
    private readonly instituition?: ListInstituitionDTO;

    //private readonly publications:number | ListaPublicacaoDTO[];
}