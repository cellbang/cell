import { DataCallback, PartialMessageInfo } from 'vscode-jsonrpc/lib/messageReader';
import { Channel } from './channel-protocol';
import { Emitter, Event } from 'vscode-jsonrpc/lib/events';

export abstract class AbstractMessageReader {

    private errorEmitter: Emitter<Error>;
    private closeEmitter: Emitter<void>;

    private partialMessageEmitter: Emitter<PartialMessageInfo>;

    constructor() {
        this.errorEmitter = new Emitter<Error>();
        this.closeEmitter = new Emitter<void>();
        this.partialMessageEmitter = new Emitter<PartialMessageInfo>();
    }

    public dispose(): void {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
    }

    public get onError(): Event<Error> {
        return this.errorEmitter.event;
    }

    protected fireError(error: any): void {
        this.errorEmitter.fire(this.asError(error));
    }

    public get onClose(): Event<void> {
        return this.closeEmitter.event;
    }

    protected fireClose(): void {
        this.closeEmitter.fire(undefined);
    }

    public get onPartialMessage(): Event<PartialMessageInfo> {
        return this.partialMessageEmitter.event;
    }

    protected firePartialMessage(info: PartialMessageInfo): void {
        this.partialMessageEmitter.fire(info);
    }

    private asError(error: any): Error {
        if (error instanceof Error) {
            return error;
        } else {
            return new Error(`Reader received error. Reason: ${typeof (error.message) === 'string' ? error.message : 'unknown'}`);
        }
    }
}

export class ChannelMessageReader extends AbstractMessageReader {

    protected state: 'initial' | 'listening' | 'closed' = 'initial';
    protected callback: DataCallback | undefined;
    protected readonly events: { message?: any, error?: any }[] = [];

    constructor(protected readonly channel: Channel) {
        super();
        this.channel.onMessage(message =>
            this.readMessage(message)
        );
    }

    listen(callback: DataCallback): void {
        if (this.state === 'initial') {
            this.state = 'listening';
            this.callback = callback;
            while (this.events.length !== 0) {
                const event = this.events.pop()!;
                if (event.message) {
                    this.readMessage(event.message);
                } else if (event.error) {
                    this.fireError(event.error);
                }
            }
        }
    }

    protected readMessage(message: any): void {
        if (this.state === 'initial') {
            this.events.splice(0, 0, { message });
        } else if (this.state === 'listening') {
            const data = JSON.parse(message);
            this.callback!(data);
        }
    }

    protected fireError(error: any): void {
        if (this.state === 'initial') {
            this.events.splice(0, 0, { error });
        } else if (this.state === 'listening') {
            super.fireError(error);
        }
    }

}
