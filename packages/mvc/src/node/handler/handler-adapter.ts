import { Component, Autowired, Value } from '@malagu/core';
import { PathResolver } from '@malagu/web';
import { Context, RequestMatcher, HandlerAdapter } from '@malagu/web/lib/node';
import { ViewResolver, ResponseResolverProvider, MethodArgsResolverProvider } from '../resolver';
import { MVC_HANDLER_ADAPTER_PRIORITY, RouteMetadataMatcher } from './handler-protocol';
import { MVC_PATH } from '../../common';
import { PipeManager } from '@malagu/core';
import { NotFoundAndContinueError } from '@malagu/web/lib/node';

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

    @Autowired(PipeManager)
    protected readonly pipeManager: PipeManager;

    @Value(MVC_PATH)
    protected readonly mvcPath: string;

    @Autowired(RouteMetadataMatcher)
    protected readonly routeMetadataMatcher: RouteMetadataMatcher;

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
        const routeMetadata = await this.routeMetadataMatcher.match();
        if (routeMetadata) {
            await this.doHandle(routeMetadata);
        } else {
            throw new NotFoundAndContinueError(`No mapping found: ${ctx.request.method} ${path}`);
        }
    }

    protected async doHandle(metadata: any, err?: any): Promise<void> {
        let args = await this.resolveMethodArgs(metadata);
        if (err) {
            args = [err, ...args];
        }
        const methodMetadata = metadata.methodMetadata;
        const target = methodMetadata.target;
        let model: any;
        try {
            await this.pipeManager.apply({ target, method: methodMetadata.key }, args);
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
        const routeMetadata = await this.routeMetadataMatcher.match(error);
        if (routeMetadata) {
            return routeMetadata;
        }
        throw error;
    }

    async canHandle(): Promise<boolean> {
        return this.requestMatcher.match(await this.pathResolver.resolve(this.mvcPath));
    }
}
