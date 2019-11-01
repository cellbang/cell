import { Message } from 'vscode-jsonrpc/lib/messages';
import { } from 'vscode-jsonrpc/lib/messageWriter';
import { Channel } from './channel-protocol';
import { Emitter, Event } from 'vscode-jsonrpc/lib/events';

export abstract class AbstractMessageWriter {

    private errorEmitter: Emitter<[Error, Message | undefined, number | undefined]>;
    private closeEmitter: Emitter<void>;

    constructor() {
        this.errorEmitter = new Emitter<[Error, Message, number]>();
        this.closeEmitter = new Emitter<void>();
    }

    public dispose(): void {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
    }

    public get onError(): Event<[Error, Message | undefined, number | undefined]> {
        return this.errorEmitter.event;
    }

    protected fireError(error: any, message?: Message, count?: number): void {
        this.errorEmitter.fire([this.asError(error), message, count]);
    }

    public get onClose(): Event<void> {
        return this.closeEmitter.event;
    }

    protected fireClose(): void {
        this.closeEmitter.fire(undefined);
    }

    private asError(error: any): Error {
        if (error instanceof Error) {
            return error;
        } else {
            return new Error(`Writer received error. Reason: ${typeof error.message === 'string' ? error.message : 'unknown'}`);
        }
    }
}

export class ChannelMessageWriter extends AbstractMessageWriter {

    protected errorCount = 0;

    constructor(protected readonly channel: Channel) {
        super();
    }

    write(msg: Message): void {
        try {
            const content = JSON.stringify(msg);
            this.channel.send(content);
        } catch (e) {
            this.errorCount++;
            this.fireError(e, msg, this.errorCount);
        }
    }

}
