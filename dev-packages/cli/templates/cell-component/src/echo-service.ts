import { Component } from "@celljs/core";

export const EchoService = Symbol('EchoService');

export interface EchoService {
    echo(text: string): string; 
}

@Component(EchoService)
export class EchoServiceImpl implements EchoService {
    echo(text: string): string {
        return text;
    }
    
}

