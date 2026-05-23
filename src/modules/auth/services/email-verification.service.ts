import { Injectable } from "@nestjs/common";
import { MailService } from "../../mail/mail.service";
import { VerificationService } from "../verification/verification.service";

@Injectable()
export class EmailVerificationService {
    constructor(
        private mailService: MailService,
        private readonly verificatinService: VerificationService
    ){}

    async sendVerificationEmail(email: string): Promise<string> {
    const code = await this.verificatinService.create(email);

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

}