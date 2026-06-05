import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    private readonly redis: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor( private readonly configService: ConfigService) {
        this.redis = new Redis({
            host: this.configService.get('REDIS_HOST'),
            port: this.configService.get<number>('REDIS_PORT')
        });

        this.registerEvents();
    }

    getClient(): Redis {
        return this.redis;
    }

    private registerEvents(): void {
        this.redis.on('connect', () => {
            this.logger.log('Connected to Redis');
        })

        this.redis.on('ready', () => {
            this.logger.log('Redis is ready');
        })

         this.redis.on('reconnecting', () => {
            this.logger.log('Redis is reconnecting');
        })

         this.redis.on('error', (error) => {
            this.logger.log('Error in connection to Redis' + error.stack);
        })

         this.redis.on('close', () => {
            this.logger.log('Redis connection closed');
        })
    }
}