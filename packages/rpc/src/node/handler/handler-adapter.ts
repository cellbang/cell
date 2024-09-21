import { Component, Autowired, Value, Deferred } from '@celljs/core';
import { ChannelManager } from '../channel';
import { RPC_HANDLER_ADAPTER_PRIORITY } from './handler-protocol';
import { RequestMatcher, HandlerAdapter, Context } from '@celljs/web/lib/node';
import { PathResolver } from '@celljs/web';
import { RPC_PATH } from '../../common';

export const PATH_PARMAS_ATTR = 'pathParams';

@Component(HandlerAdapter)
export class RpcHandlerAdapter implements HandlerAdapter {
    readonly priority = RPC_HANDLER_ADAPTER_PRIORITY;

    @Autowired(ChannelManager)
    protected readonly channelManager: ChannelManager;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value(RPC_PATH)
    protected readonly rpcPath: string;

    async handle(): Promise<void> {
        await this.channelManager.handleChannels();
        const response = Context.getResponse();
        if (response.body instanceof Deferred) {
            response.body = await response.body.promise;
        }
    }

    async canHandle(): Promise<boolean> {
        return this.requestMatcher.match(await this.pathResolver.resolve(this.rpcPath));
    }

}
