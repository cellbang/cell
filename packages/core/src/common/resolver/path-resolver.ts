import { PathResolver } from './resolver-protocol';
import { Value, Component } from '../annotation';
import urlJoin  =  require('url-join');

@Component(PathResolver)
export class PathResolverImpl implements PathResolver {

    @Value('malagu.server.path')
    protected readonly serverPath: string;

    async resolve(...parts: string[]): Promise<string> {
        return urlJoin(this.serverPath, ...parts);
    }
}
