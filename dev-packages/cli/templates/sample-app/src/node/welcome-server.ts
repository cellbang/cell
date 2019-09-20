import { WelcomeServer } from '../common/welcome-protocol';
import { Rpc } from '@malagu/core/lib/common/annotation';

@Rpc(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
    say(): Promise<string> {
        return Promise.resolve('Welcome to Malagu');
    }
}
