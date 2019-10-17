import { Component, Autowired, Value } from '../../common/annotation';
import { ChannelManager } from '../channel';
import { Context } from '../context';
import { ViewResolver, ResponseResolverProvider, MethodArgsResolverProvider } from '../resolver';
import { HttpError } from '../error';
import { HandlerAdapter, MVC_HANDLER_ADAPTER_PRIORITY, RPC_HANDLER_ADAPTER_PRIORITY } from './handler-protocol';
import { RequestMatcher } from '../matcher';
import { PathResolver, RPC_PATH, MVC_PATH } from '../../common';
import { RouteProvider } from './route-provider';

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

    @Autowired(RouteProvider)
    protected readonly routeProvider: RouteProvider;

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
        const route = await this.routeProvider.provide();
        const pathMap = route.mapping.get(ctx.request.method!.toLowerCase());
        if (pathMap) {
            for (const entry of pathMap) {
                const [ p, metadata ] = entry;
                const pathParams = await this.requestMatcher.match(p);
                if (pathParams) {
                    Context.setAttr(PATH_PARMAS_ATTR, pathParams);
                    await this.doHandle(metadata);
                    return;
                }
            }
        }
        const error = new HttpError(404, `No mapping found: ${ctx.request.method} ${path}`);
        await this.doHandle(await this.getErrorMetadata(error), error);
    }

    protected async doHandle(metadata: any, err?: Error): Promise<void> {
        let args = await this.resolveMethodArgs(metadata);
        if (err) {
            args = [err, ...args];
        }
        const methodMetadata = metadata.methodMetadata;
        const target = methodMetadata.target;
        let model: any;
        try {
            model = await target[methodMetadata.key](...args);
        } catch (error) {
            if (!err) {
                const errorMetadata = await this.getErrorMetadata(error);
                if (!errorMetadata.viewMetadata.viewName) {
                    errorMetadata.viewMetadata.viewName = metadata.viewMetadata.viewName;
                }
                await this.doHandle(errorMetadata, error);
            } else {
                throw error;
            }
        }
        if (model) {
            await this.viewResolver.resolve(metadata, model);
        }
        await this.resolveResponse(metadata);
    }

    protected async getErrorMetadata(error: Error) {
        const route = await this.routeProvider.provide();
        const metadata = route.errorMapping.get(error.constructor);
        if (metadata) {
            return metadata;
        } else {
            for (const entry of route.errorMapping) {
                if (error instanceof <any>entry[0]) {
                    return entry[1];
                }
            }
        }
        throw error;
    }

    async canHandle(): Promise<boolean> {
        return this.requestMatcher.match(await this.pathResolver.resolve(this.mvcPath));
    }
}
