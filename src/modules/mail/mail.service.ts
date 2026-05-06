import { Injectable } from "@nestjs/common";
import * as nodeMailer from 'nodemailer';

@Injectable()
export class MailService {

    private transporter = nodeMailer.createTransport({
        
    });

    async sendEmail(to: string, subject: string, text: string) {

    }

}