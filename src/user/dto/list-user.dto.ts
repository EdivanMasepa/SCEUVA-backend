
export class ListUserDTO{
    constructor(
        private readonly id:number, 
        private readonly userType:string,
        private readonly name:string, 
        private readonly email:string, 
        private readonly phone:string,
        private readonly moderator:boolean,
        // private readonly specification: ListaPessoaDTO | ListaInstituicaoDTO,
        // private readonly publications:number | ListaPublicacaoDTO[]
    ){}
}