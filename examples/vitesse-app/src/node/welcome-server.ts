import { Rpc } from '@celljs/rpc'
import { WelcomeServer } from '../common/welcome-protocol'

@Rpc(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
  async say(): Promise<string> {
    return 'Welcome to Cell'
  }
}
