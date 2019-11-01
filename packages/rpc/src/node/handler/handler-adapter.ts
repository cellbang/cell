import { Component, Autowired, Value } from '@malagu/core';
import { ChannelManager } from '../channel';
import { RPC_HANDLER_ADAPTER_PRIORITY } from './handler-protocol';
import { RequestMatcher, HandlerAdapter } from '@malagu/web/lib/node';
import { PathResolver } from '@malagu/web';
import { RPC_PATH } from '../../common';

export const PATH_PARMAS_ATTR = 'pathParams';

@Component(HandlerAdapter)
export class RpcHandlerAdapter implements HandlerAdapter {
    readonly priority = RPC_HANDLER_ADAPTER_PRIORITY;

    @Autowired
    protected readonly channelManager: ChannelManager;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value(RPC_PATH)
    protected readonly rpcPath: string;

    handle(): Promise<void> {
        return this.channelManager.handleChannels();
    }

    async canHandle(): Promise<boolean> {
        return this.requestMatcher.match(await this.pathResolver.resolve(this.rpcPath));
    }

}
