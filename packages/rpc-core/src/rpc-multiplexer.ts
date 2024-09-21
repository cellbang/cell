import { Event } from '@celljs/core/lib/common/utils/event';
import { Emitter } from '@celljs/core/lib/common/utils/emitter';
import { DisposableCollection, Disposable } from '@celljs/core/lib/common/utils/disposable';
import { ConnectionClosedError, MessageConnection } from './rpc-protocol';

/**
 * Sends/Receives multiple messages in one go:
 *  - multiple messages to be sent from one stack get sent in bulk at `process.nextTick`.
 *  - each incoming message is handled in a separate `process.nextTick`.
 */
export class RPCMultiplexer implements Disposable, MessageConnection {
    private readonly connection: MessageConnection;
    private readonly sendAccumulatedBound: () => void;

    private messagesToSend: string[];

    private readonly messageEmitter = new Emitter<string>();
    private readonly toDispose = new DisposableCollection();

    constructor(connection: MessageConnection) {
        this.connection = connection;
        this.sendAccumulatedBound = this.sendAccumulated.bind(this);

        this.toDispose.push(Disposable.create(() => (this.messagesToSend = [])));
        this.toDispose.push(
            this.connection.onMessage((msg: string) => {
                try {
                    const messages = JSON.parse(msg);
                    for (const message of messages) {
                        this.messageEmitter.fire(message);
                    }
                } catch (e) {
                    // NoOp
                }
            })
        );
        this.toDispose.push(this.messageEmitter);

        this.messagesToSend = [];
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    get onMessage(): Event<string> {
        return this.messageEmitter.event;
    }

    private sendAccumulated(): void {
        const tmp = this.messagesToSend;
        this.messagesToSend = [];
        this.connection.send(JSON.stringify(tmp));
    }

    public send(msg: string): void {
        if (this.toDispose.disposed) {
            throw ConnectionClosedError.create();
        }
        if (this.messagesToSend.length === 0) {
            setTimeout(this.sendAccumulatedBound, 0);
        }
        this.messagesToSend.push(msg);
    }
}
