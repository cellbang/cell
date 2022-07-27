export const CasbinProvider = Symbol("CasbinProvider");
export const CasbinManager = Symbol("CasbinManager");

export interface CasbinManager {
    authenticate(next: () => Promise<void>): Promise<void>;
    support(): Promise<boolean>;
}

export interface CasbinProvider {
    readonly priority: number;
    authenticate(): Promise<any>;
    support(): Promise<boolean>;
}
