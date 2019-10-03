import { Component, Autowired, Optional, Value } from '../../common/annotation';
import { CONTROLLER, ControllerMetadata } from '../annotation/controller';
import { METADATA_KEY } from '../constants';
import { StrOrRegex, MethodMetadata } from '../annotation/method';
import { PathResolver } from '../../common';

@Component()
export class RouteBuilder {

    @Autowired(CONTROLLER) @Optional
    protected readonly controllers: any[] = [];

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value('malagu.mvc.defaultViewName')
    protected readonly defaultViewName: string;

    async build() {
        const routeMap: Map<string, Map<StrOrRegex, any>> = new Map<string, Map<StrOrRegex, any>>();

        for (const controller of this.controllers) {
            const targetConstructor = controller.target ? controller.target.constructor : controller.constructor;

            const controllerMetadata = <ControllerMetadata>Reflect.getOwnMetadata(METADATA_KEY.controller, targetConstructor);
            const methodMetadata: MethodMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.controllerMethod,
                targetConstructor
            ) || [];
            for (const metadata of methodMetadata) {
                const routeOptions: any = (typeof metadata.options === 'string' || metadata.options instanceof RegExp) ? { path: metadata.options } : metadata.options;
                const method = metadata.method;
                metadata.target = controller;
                let pathMap = routeMap.get(method);
                if (!pathMap) {
                    pathMap = new Map<StrOrRegex, any>();
                    routeMap.set(method, pathMap);
                }
                let path: StrOrRegex = routeOptions.path;
                if (typeof path === 'string' ) {
                    path = await this.pathResolver.resolve(controllerMetadata.path, path);
                } else if (path instanceof RegExp) {
                    path = new RegExp(await this.pathResolver.resolve(controllerMetadata.path, path.source));
                }
                pathMap.set(path, {
                    controllerMetadata,
                    methodMetadata: metadata,
                    paramMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerParam, targetConstructor, metadata.key),
                    bodyMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerBody, targetConstructor, metadata.key),
                    queryMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerQuery, targetConstructor, metadata.key),
                    requestHeaderMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestHeader, targetConstructor, metadata.key),
                    responseHeaderMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseHeader, targetConstructor, metadata.key),
                    requestCookieMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestCookie, targetConstructor, metadata.key),
                    responseCookieMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseCookie, targetConstructor, metadata.key),
                    requestSessionMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestSession, targetConstructor, metadata.key),
                    responseSessionMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseSession, targetConstructor, metadata.key),
                    viewMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerView, targetConstructor, metadata.key) || { viewName: this.defaultViewName }
                });
            }
        }
        return routeMap;
    }
}
