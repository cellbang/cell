import { Component, Autowired, Value } from '../../common/annotation';
import { ChannelManager } from '../channel';
import { Context } from '../context';
import { StrOrRegex, MethodMetadata } from '../annotation/method';
import { RouteBuilder } from './route-builder';
import { ViewResolver, ResponseResolverProvider, MethodArgsResolverProvider } from '../resolver';
import { HttpError } from '../error';
import { HandlerAdapter, MVC_HANDLER_ADAPTER_PRIORITY, RPC_HANDLER_ADAPTER_PRIORITY } from './handler-protocol';
import { RequestMatcher } from '../matcher';
import { PathResolver, RPC_PATH, MVC_PATH } from '../../common';
import { postConstruct } from 'inversify';

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

@Component(HandlerAdapter)
export class MvcHandlerAdapter implements HandlerAdapter {
    readonly priority = MVC_HANDLER_ADAPTER_PRIORITY;

    @Autowired(MethodArgsResolverProvider)
    protected readonly methodArgsResolverProvider: MethodArgsResolverProvider;

    @Autowired(ResponseResolverProvider)
    protected readonly responseResolverProvider: ResponseResolverProvider;

    @Autowired(ViewResolver)
    protected readonly viewResolver: ViewResolver;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value(MVC_PATH)
    protected readonly mvcPath: string;

    protected routeMap: Map<string, Map<StrOrRegex, any>> = new Map<string, Map<StrOrRegex, any>>();

    @Autowired(RouteBuilder)
    protected readonly routeBuilder: RouteBuilder;

    @postConstruct()
    protected async init() {
        this.routeMap = await this.routeBuilder.build();
    }

    protected async resolveMethodArgs(metadata: any) {
        const args: any[] = [];
        for (const resolver of this.methodArgsResolverProvider.provide()) {
            await resolver.resolve(metadata, args);
        }
        return args;
    }

    protected async resolveResponse(metadata: any) {
        for (const resolver of this.responseResolverProvider.provide()) {
            await resolver.resolve(metadata);
        }
    }

    async handle(): Promise<void> {
        const ctx = Context.getCurrent();
        const path = ctx.request.path;
        const pathMap = this.routeMap.get(ctx.request.method!.toLowerCase());
        if (pathMap) {
            for (const entry of pathMap) {
                const [ p, metadata ] = entry;
                const pathParams = await this.requestMatcher.match(p);
                if (pathParams) {
                    Context.setAttr(PATH_PARMAS_ATTR, pathParams);
                    const args = await this.resolveMethodArgs(metadata);
                    const methodMetadata = <MethodMetadata>metadata.methodMetadata;
                    const target = methodMetadata.target;
                    const model = await target[methodMetadata.key](...args);
                    if (model) {
                        await this.viewResolver.resolve(metadata, model);
                    }
                    await this.resolveResponse(metadata);
                    return;
                }
            }
        }
        throw new HttpError(404, `Path not found: ${path}`);
    }

    async canHandle(): Promise<boolean> {
        return this.requestMatcher.match(await this.pathResolver.resolve(this.mvcPath));
    }
}
