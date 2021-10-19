import { Message, AbstractMessageWriter } from 'vscode-jsonrpc';
import { Channel } from '../channal';

export class ChannelMessageWriter extends AbstractMessageWriter {

    protected errorCount = 0;

    constructor(protected readonly channel: Channel) {
        super();
    }

    async write(msg: Message): Promise<void> {
        try {
            const content = JSON.stringify(msg);
            this.channel.send(content);
        } catch (e) {
            this.errorCount++;
            this.fireError(e, msg, this.errorCount);
        }
    }

    end() {

    }

}
