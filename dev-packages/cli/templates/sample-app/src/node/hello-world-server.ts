import { HelloWorldServer } from '../common/hello-world-protocol';
import { rpc } from '@malagu/core/lib/common/annotation';

@rpc(HelloWorldServer)
export class HelloWorldServerImpl implements HelloWorldServer {
    say(): Promise<string> {
        return Promise.resolve('Hello world.');
    }
}
