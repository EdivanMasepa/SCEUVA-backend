export abstract class VerificationStorage {
    abstract save(email: string, code: string): Promise<void>;
    abstract validate(email:string, code: string): Promise<boolean>;
    abstract remove(email: string): Promise<void>;
}