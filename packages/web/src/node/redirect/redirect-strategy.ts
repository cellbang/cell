import { RedirectStrategy } from './redirect-protocol';
import { Autowired, Component } from '@malagu/core';
import { Context } from '../context';
import { HttpStatus, HttpHeaders } from '@malagu/http';
import { PathResolver } from '../../common/resolver';

@Component(RedirectStrategy)
export class DefaultRedirectStrategy implements RedirectStrategy {

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    async send(url: string): Promise<void> {
        const response = Context.getResponse();
        response.statusCode = HttpStatus.FOUND;
        response.setHeader(HttpHeaders.LOCATION, await this.pathResolver.resolve(url));
    }

}
