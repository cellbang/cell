import { WelcomeServer } from '../common/welcome-protocol';
import { Rpc } from '@malagu/core';

@Rpc(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
    say(): Promise<string> {
        return Promise.resolve('Welcome to Malagu');
    }
}
