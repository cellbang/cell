export const ServiceA = 'ServiceA';
export const ServiceB = 'ServiceB';

export interface ServiceA {
    say(): Promise<string>;
}

export interface ServiceB {
    say(): Promise<string>;
}
