import { Injectable, Logger } from "@nestjs/common";
import { VerificationStorage } from "./verification-storage.abstract";
import { RedisService } from "../../../shared/redis/redis.service";

@Injectable()
export class RedisVerificationStorageService implements VerificationStorage {
    private readonly TTL_SECONDS = 60 *15;

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
    }

    async validate(email: string, code: string): Promise<boolean> {
        const savedCode = await this.redisService
            .getClient()
            .get(`email_verification: ${email}`);

        if(!savedCode) {
            return false;
        }

        if(savedCode !== code ) {
            return false;
        }
        
        await this.remove(email);

        return true;
    }

    async remove(email: string): Promise <void> {
        await this.redisService
            .getClient()
            .del(`email_verification: ${email}`);
    }
}