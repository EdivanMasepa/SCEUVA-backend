import { Expose } from "class-transformer";

export class ListPersonDTO{
    @Expose()
    private readonly birthDate:number;

    @Expose()
    private readonly gender:string;
        
    @Expose()
    private readonly riskLevel:string;
}