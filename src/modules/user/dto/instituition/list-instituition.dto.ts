import { Expose } from "class-transformer";

export class ListInstituitionDTO{
    @Expose()
    private readonly cnpj:number;

    @Expose()
    private readonly foundationDate:string;

    @Expose()
    private readonly segment:string;
}