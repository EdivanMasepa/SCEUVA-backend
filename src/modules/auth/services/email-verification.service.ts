import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { MailService } from "../../mail/mail.service";
import { VerificationService } from "../verification/verification.service";
import { UserService } from "../../user/user.service";
import { UpdateUserDTO } from "../../user/dto/update-user.dto";

@Injectable()
export class EmailVerificationService {
    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        private readonly mailService: MailService,
        private readonly verificationService: VerificationService
    ){}

    async sendVerificationEmail(email: string): Promise<string> {
        const code = await this.verificationService.create(email);
        const message = `
Olá! 👋

Recebemos uma solicitação para verificar seu e-mail.

Seu código de verificação é:

${code}

Se você não realizou esta solicitação, ignore este e-mail.

Atenciosamente,
Equipe SCEUVA.
`;

        await this.mailService.sendEmail(
            email,
            'Código de Verificação de e-mail',
            message,
        );

        return code;
    }
        
    async resendVerificationEmail(email: string): Promise<{statusCode: number; message: string}> {
        const user = await this.userService.findByIdentifier(email, false);

        if (!user) 
            throw new NotFoundException('Usuário não encontrado.');

        await this.sendVerificationEmail(user.email);

        return{statusCode: 200, message: 'Email reenviado com sucesso.'};
    }

    async verifyEmail(email: string, code: string): Promise<void> {
        try{
            const user = await this.userService.findByIdentifier(email, false);

            if (!user) 
                throw new NotFoundException('Usuário não encontrado.');

            if(user.emailVerified === true)
                throw new BadRequestException('E-mail já verificado.');

            const isValid = await this.verificationService.validate(email, code);

            if(!isValid)
                throw new BadRequestException('Código de verificação inválido.');

            const userUpdated: UpdateUserDTO = {
                emailVerified: true
            };

            await this.userService.update(user.id, userUpdated);
            
        }catch(erro){
            if(erro instanceof NotFoundException || erro instanceof BadRequestException)
                throw erro;
            
            throw new InternalServerErrorException('Erro ao atulizar verificação de e-mail. Entre em contato com o suporte.')
        }
    }
}