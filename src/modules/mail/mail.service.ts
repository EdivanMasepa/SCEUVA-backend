import { Injectable } from "@nestjs/common";
import * as nodeMailer from 'nodemailer';

@Injectable()
export class MailService {

    private transporter = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        requireTLS: true,
    });

    async sendEmail(to: string, subject: string, text: string) {
        await this.transporter.sendMail({
            from: `"Sistema" <${process.env.EMAIL}>`,
            to,
            subject,
            text,
        });
    }

}