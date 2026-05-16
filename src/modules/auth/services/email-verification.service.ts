import { Injectable } from "@nestjs/common";
import { MailService } from "../../mail/mail.service";
import { VerificationService } from "../verification/verification.service";

@Injectable()
export class EmailVerificationService {
    constructor(
        private mailService: MailService,
        private readonly verificatinService: VerificationService
    ){}

    async sendVerificationEmail(email: string): Promise<string>{
        const code = await this.verificatinService.create(email);

        await this.mailService.sendEmail(email, 'Código de Verificação', `Seu código de verificação é: ${code}`);

        return code;
    }

}