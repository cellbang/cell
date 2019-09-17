import { Component, Autowired, Value } from '../../common/annotation';
import { ChannelManager } from '../channel';
import { Context } from '../context';
import { StrOrRegex, MethodMetadata } from '../annotation/method';
import { RouteBuilder } from './route-builder';
import { ViewResolver, ResponseResolverProvider, MethodArgsResolverProvider } from '../resolver';
import { HttpError } from '../error';
import { HandlerAdapter } from './handler-protocol';
const urlJoin = require('url-join');
const UrlPattern = require('url-pattern');

export const PATH_PARMAS_ATTR = 'pathParams';

@Component(HandlerAdapter)
export class RpcHandlerAdapter implements HandlerAdapter {

    @Autowired
    protected readonly channelManager: ChannelManager;

    @Value
    protected readonly rpcPath: string;

    @Value
    protected readonly rootPath?: string;

    handle(): Promise<void> {
        return this.channelManager.handleChannels();
    }

    canHandle(): Promise<boolean> {
        const ctx = Context.getCurrent();
        const path = ctx.request.path;
        return Promise.resolve(path.startsWith(urlJoin(this.rootPath, this.rpcPath)));
    }

}

@Component(HandlerAdapter)
export class ControllerHandlerAdapter implements HandlerAdapter {

    @Autowired(MethodArgsResolverProvider)
    protected readonly methodArgsResolverProvider: MethodArgsResolverProvider;

    @Autowired(ResponseResolverProvider)
    protected readonly responseResolverProvider: ResponseResolverProvider;

    @Autowired(ViewResolver)
    protected readonly viewResolver: ViewResolver;

    @Value
    protected readonly rpcPath: string;

    @Value
    protected readonly rootPath?: string;

    protected routeMap: Map<string, Map<StrOrRegex, any>> = new Map<string, Map<StrOrRegex, any>>();

    constructor(@Autowired(RouteBuilder) protected readonly routeBuilder: RouteBuilder) {
        this.routeMap = this.routeBuilder.build();
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
                const pattern = new UrlPattern(p);
                const pathParams = pattern.match(path);
                if (pathParams) {
                    Context.setAttr(PATH_PARMAS_ATTR, pathParams);
                    const args = await this.resolveMethodArgs(metadata);
                    const methodMetadata = <MethodMetadata>metadata.methodMetadata;
                    const model = await methodMetadata.descriptor.value!.apply(methodMetadata.target, args);
                    if (model) {
                        await this.viewResolver.resolve(metadata, model);
                    }
                    await this.resolveResponse(metadata);
                    return;
                }
            }
        }
        throw new HttpError(404, `Path not found: ${path}.`);
    }

    canHandle(): Promise<boolean> {
        const ctx = Context.getCurrent();
        const path = ctx.request.path;
        return Promise.resolve(!path.startsWith(urlJoin(this.rootPath, this.rpcPath)));
    }
}
