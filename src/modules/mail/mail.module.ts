import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";

@Module({
    exports: [MailService],
    providers: [MailService],
    controllers: [MailController]
})
export class MailModule {}