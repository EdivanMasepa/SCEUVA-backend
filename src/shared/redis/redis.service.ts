import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    private readonly redis: Redis;

    constructor( private readonly configService: ConfigService) {
        this.redis = new Redis({
            host: this.configService.get('REDIS_HOST'),
            port: this.configService.get<number>('REDIS_PORT')
        });

    }

    getClient(): Redis {
        return this.redis;
    }
}