export const Cookies = Symbol('Cookies');

export interface Cookies {
    get(name: string, opt?: any): string | undefined;
    set(name: string, vaule: string, opt?: any): void;
}
