import { Injectable } from "@nestjs/common";
import { VerificationStorage } from "./verification-storage.abstract";
import e from "express";

@Injectable()
export class VerificationService {
    constructor(
        private readonly verificationStorage: VerificationStorage
    ) {}

    generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async create(email: string): Promise<string> {
        const code = this.generateCode();

        await this.verificationStorage.save(email, code); 

        return code;
    }

    async validate(email: string, code: string): Promise<boolean> {
        return await this.verificationStorage.validate(email, code);
    }
}