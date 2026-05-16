import { Injectable } from "@nestjs/common";
import { VerificationStorage } from "./verification-storage.abstract";
import { VerificationData } from "../../../shared/types/verification.data";

@Injectable()
export class MemoryVerificationStorageService implements VerificationStorage {
    private storage = new Map<string, VerificationData>();

    async save(email: string, code: string): Promise<void> {
        this.storage.set(email, {
            code,
            expiresAt: Date.now() + 1000 * 60 * 15
        })
    }

    async validate(email: string, code: string): Promise<boolean> {
        const data = this.storage.get(email);

        if(!data){
            this.storage.delete(email);
            return false;
        }

        if(Date.now() > data.expiresAt) {
            this.storage.delete(email);
            return false;
        }

        if(data.code === code) {
            this.storage.delete(email);
            return true;
        }

        return false;
    }

    async remove(email: string): Promise<void> {
        this.storage.delete(email);
    }
}