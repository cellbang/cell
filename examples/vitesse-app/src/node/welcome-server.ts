import { WelcomeServer } from '../common/welcome-protocol';
import { Rpc } from '@celljs/rpc';

@Rpc(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
    say(): Promise<string> {
        return Promise.resolve('Welcome to Cell');
    }
}
