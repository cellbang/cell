import { Channel, AbstractChannel } from './channel-protocol';

export class HttpChannel extends AbstractChannel {

    constructor(
        id: number,
        doSend: (content: string) => Promise<void>,
        protected readonly path?: string
    ) {
        super(id, doSend);
    }

    protected checkNotDisposed(): void {
        // noop
    }

    handleMessage(message: Channel.HttpMessage) {
        this.fireMessage(message.content);
    }

    doGetMessage(content: string): Channel.Message {
        return <Channel.HttpMessage>{
            kind: 'http',
            id: this.id,
            path: this.path,
            content
        };
    }

}
