import { Injectable, Logger } from "@nestjs/common";
import { VerificationStorage } from "./verification-storage.abstract";
import { RedisService } from "../../../../shared/redis/redis.service";
import { maskEmail } from "../../../../shared/functions/maskEmail";

@Injectable()
export class RedisVerificationStorageService implements VerificationStorage {
    private readonly TTL_SECONDS = 60 *15;
    private readonly logger = new Logger(RedisVerificationStorageService.name);

    constructor(private readonly redisService: RedisService) {}

    async save(email: string, code: string): Promise<void> {
        await this.redisService
        .getClient()
        .set(
            `email_verification: ${email}`,
            code,
            'EX',
            this.TTL_SECONDS
        );

        this.logger.log(`Code saved for ${maskEmail(email)}`);
    }

    async validate(email: string, code: string): Promise<boolean> {
        const savedCode = await this.redisService
            .getClient()
            .get(`email_verification: ${email}`);

        if(!savedCode) {
            this.logger.log(`No code found for ${maskEmail(email)}`);
            return false;
        }

        if(savedCode !== code ) {
            this.logger.log(`Invalid code for ${maskEmail(email)}`);
            return false;
        }
        
        await this.remove(email);
        return true;
    }

    async remove(email: string): Promise<void> {
        await this.redisService
            .getClient()
            .del(`email_verification: ${email}`);

        this.logger.log(`Code removed for ${maskEmail(email)}`)
    }
}