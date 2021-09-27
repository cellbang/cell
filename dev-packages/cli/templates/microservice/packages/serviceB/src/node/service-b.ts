import { ServiceB } from '@microservice/api';
import { Rpc } from '@malagu/rpc';

@Rpc(ServiceB)
export class ServiceBImpl implements ServiceB {
    say(): Promise<string> {
        return Promise.resolve('Service B');
    }
}
