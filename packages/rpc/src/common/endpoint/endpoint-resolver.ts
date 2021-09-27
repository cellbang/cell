import { Autowired, Component, Value } from '@malagu/core';
import { RPC_PATH } from '../constants';
import { PathResolver } from '@malagu/web';
import { EndpointNotFoundError } from '../error';
import { EndpointResolver } from './endpoint-protocol';

@Component(EndpointResolver)
export class EndpointResolverImpl implements EndpointResolver {

    @Value('malagu.rpc.endpoint')
    protected readonly endpoint?: { [id: string]: string };

    @Value('malagu.rpc.defaultEndpoint')
    protected readonly defaultEndpoint?: string;

    @Value(RPC_PATH)
    protected readonly rpcPath: string;

    @Autowired(PathResolver)
    protected pathResolver: PathResolver;

    protected parsed: Map<string, string>;

    async resolve(serviceIdentifier: string): Promise<string> {
        let result: string | undefined;
        if (this.endpoint) {
            result = this.endpoint[serviceIdentifier];
        }
        if (/^https?:/i.test(serviceIdentifier)) {
            result = serviceIdentifier;
        }
        if (!result) {
            result = this.defaultEndpoint;
        }
        if (!result && typeof location !== 'undefined') {
            result = `${location.protocol}//${location.host}{rpcPath}/{serviceIdentifier}`;
        }
        if (!result) {
            throw new EndpointNotFoundError(serviceIdentifier);
        }
        return result
            .replace(/{rpcPath}/g, await this.pathResolver.resolve(this.rpcPath))
            .replace(/{serviceIdentifier}/g, serviceIdentifier);
    }

}
