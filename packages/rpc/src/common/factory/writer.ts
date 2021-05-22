import { Message } from 'vscode-jsonrpc';
import { AbstractMessageWriter } from 'vscode-jsonrpc/lib/messageWriter';
import { Channel } from '../channal';

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
