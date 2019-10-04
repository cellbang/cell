import { IWebSocket } from 'vscode-ws-jsonrpc/lib/socket/socket';
import { Disposable } from '../utils/disposable';
import { Emitter } from 'vscode-jsonrpc';
import { AbstractChannel, Channel } from './channel-protocol';

export class WebSocketChannel extends AbstractChannel implements IWebSocket {

    protected readonly closeEmitter = new Emitter<[number, string]>();

    constructor(
        id: number,
        doSend: (content: string) => Promise<void>
    ) {
        super(id, doSend);
        this.toDispose.push(this.closeEmitter);
    }

    handleMessage(message: Channel.Message) {
        if (message.kind === 'ready') {
            this.fireOpen();
        } else if (message.kind === 'data') {
            this.fireMessage(message.content);
        } else if (message.kind === 'close') {
            this.fireClose(message.code, message.reason);
        }
    }

    open(path: string): void {
        this.checkNotDisposed();
        this.doSend(JSON.stringify(<Channel.OpenMessage>{
            kind: 'open',
            id: this.id,
            path
        }));
    }

    ready(): void {
        this.checkNotDisposed();
        this.doSend(JSON.stringify(<Channel.ReadyMessage>{
            kind: 'ready',
            id: this.id
        }));
    }

    doGetMessage(content: string): Channel.Message {
        return <Channel.DataMessage>{
            kind: 'data',
            id: this.id,
            content
        };
    }

    close(code: number = 1000, reason: string = ''): void {
        this.checkNotDisposed();
        this.doSend(JSON.stringify(<Channel.CloseMessage>{
            kind: 'close',
            id: this.id,
            code,
            reason
        }));
        this.fireClose(code, reason);
    }

    protected fireOpen: () => void = () => { };
    onOpen(cb: () => void): void {
        this.checkNotDisposed();
        this.fireOpen = cb;
        this.toDispose.push(Disposable.create(() => this.fireOpen = () => { }));
    }

    protected closing = false;
    protected fireClose(code: number, reason: string): void {
        if (this.closing) {
            return;
        }
        this.closing = true;
        try {
            this.closeEmitter.fire([code, reason]);
        } finally {
            this.closing = false;
        }
        this.dispose();
    }
    onClose(cb: (code: number, reason: string) => void): Disposable {
        this.checkNotDisposed();
        return this.closeEmitter.event(([code, reason]) => cb(code, reason));
    }

}
