import { Controller, Get } from "@nestjs/common";
import { MailService } from "./mail.service";

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Get()
    async send() {
        await this.mailService.sendEmail(`${process.env.SECOND_EMAIL}`, 'Teste', 'Funcionou!');

        return { message: 'Email enviado' };
    }

}