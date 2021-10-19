import { DataCallback, AbstractMessageReader, Disposable } from 'vscode-jsonrpc';
import { Channel } from '../channal/channel-protocol';

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

    listen(callback: DataCallback): Disposable {
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
        return Disposable.create(() => {});
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
