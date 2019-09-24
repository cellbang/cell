import { MessageConnection } from 'vscode-jsonrpc';

export const ConnectionHandler = Symbol('ConnectionHandler');

export interface ConnectionHandler {
    readonly path: string;
    onConnection(connection: MessageConnection): void;
}

export class NoOpConnectionHandler implements ConnectionHandler {
    readonly path: string;
    onConnection(connection: MessageConnection): void {}
}
