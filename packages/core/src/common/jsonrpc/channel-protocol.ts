import { Disposable } from 'vscode-jsonrpc';
import { DisposableCollection } from '../utils/disposable';

export interface Channel {
    handleMessage(message: Channel.Message): void;
    send(content: string): void;
    onMessage(cb: (data: any) => void): void;
}

export namespace Channel {
    export interface OpenMessage {
        kind: 'open'
        id: number
        path: string
    }
    export interface ReadyMessage {
        kind: 'ready'
        id: number
    }
    export interface DataMessage {
        kind: 'data'
        id: number
        content: string
    }
    export interface CloseMessage {
        kind: 'close'
        id: number
        code: number
        reason: string
    }
    export interface HttpMessage {
        kind: 'http'
        id: number
        path?: string
        content: string
    }
    export type Message = OpenMessage | ReadyMessage | DataMessage | CloseMessage | HttpMessage;
}

export abstract class AbstractChannel implements Channel, Disposable {

    protected readonly toDispose = new DisposableCollection();

    constructor(
        readonly id: number,
        protected readonly doSend: (content: string) => Promise<void>
    ) { }

    dispose(): void {
        this.toDispose.dispose();
    }

    protected checkNotDisposed(): void {
        if (this.toDispose.disposed) {
            throw new Error('The channel has been disposed.');
        }
    }

    abstract handleMessage(message: Channel.Message): void;

    abstract doGetMessage(content: string): Channel.Message;

    send(content: string): void {
        this.checkNotDisposed();
        this.doSend(JSON.stringify(this.doGetMessage(content)));
    }

    protected fireMessage: (data: any) => void = () => { };
    onMessage(cb: (data: any) => void): void {
        this.checkNotDisposed();
        this.fireMessage = cb;
        this.toDispose.push(Disposable.create(() => this.fireMessage = () => { }));
    }

    fireError: (reason: any) => void = () => { };
    onError(cb: (reason: any) => void): void {
        this.checkNotDisposed();
        this.fireError = cb;
        this.toDispose.push(Disposable.create(() => this.fireError = () => { }));
    }

}
