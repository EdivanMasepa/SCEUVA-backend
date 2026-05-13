import { Injectable } from "@nestjs/common";
import { MailService } from "../../mail/mail.service";

@Injectable()
export class EmailVerificationService {
    constructor(private mailService: MailService){}

    async sendVerificationCode(email: string): Promise<string>{
        const code = this.generateCode();
        //await this.saveVerificationCode(email, code);
        await this.mailService.sendEmail(email, 'Código de Verificação', `Seu código de verificação é: ${code}`);
        return code;

    }

    async validateCode(email: string, code: string): Promise<Boolean>{
        const validate = false;

        return validate;
    }

    private generateCode(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}