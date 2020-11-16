import { MessageConnection } from 'vscode-jsonrpc';
import { ConnectionHandler } from './handler-protocol';

export class NoOpConnectionHandler implements ConnectionHandler {
    readonly path: string;
    onConnection(connection: MessageConnection): void {}
}
