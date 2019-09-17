import { Component, Autowired, Optional, Value } from '../../common/annotation';
import { CONTROLLER, ControllerMetadata } from '../annotation/controller';
import { METADATA_KEY } from '../constants';
import { StrOrRegex, MethodMetadata } from '../annotation/method';
const urlJoin = require('url-join');

@Component()
export class RouteBuilder {

    @Autowired(CONTROLLER) @Optional
    protected readonly controllers: any[] = [];

    @Value
    protected readonly rootPath?: string;

    @Value
    protected readonly defaultViewName: string;

    build() {
        const routeMap: Map<string, Map<StrOrRegex, any>> = new Map<string, Map<StrOrRegex, any>>();
        for (const controller of this.controllers) {
            const controllerMetadata = <ControllerMetadata>Reflect.getOwnMetadata(METADATA_KEY.controller, controller.constructor);
            const methodMetadata: MethodMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.controllerMethod,
                controller.constructor
            );
            for (const metadata of methodMetadata) {
                const routeOptions: any = (typeof metadata.options === 'string' || metadata.options instanceof RegExp) ? { path: metadata.options } : metadata.options;
                const method = metadata.method;
                let pathMap = routeMap.get(method);
                if (!pathMap) {
                    pathMap = new Map<StrOrRegex, any>();
                    routeMap.set(method, pathMap);
                }
                let path: StrOrRegex = routeOptions.path;
                if (typeof path === 'string' ) {
                    path = urlJoin(this.rootPath, controllerMetadata.path, path);
                } else if (path instanceof RegExp) {
                    path = new RegExp(urlJoin(this.rootPath, controllerMetadata.path, path.source));
                }
                pathMap.set(path, {
                    controllerMetadata,
                    methodMetadata: metadata,
                    paramMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerParam, controller.constructor, metadata.key),
                    bodyMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerBody, controller.constructor, metadata.key),
                    queryMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerQuery, controller.constructor, metadata.key),
                    requestHeaderMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestHeader, controller.constructor, metadata.key),
                    responseHeaderMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseHeader, controller.constructor, metadata.key),
                    requestCookieMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestCookie, controller.constructor, metadata.key),
                    responseCookieMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseCookie, controller.constructor, metadata.key),
                    requestSessionMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestSession, controller.constructor, metadata.key),
                    responseSessionMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseSession, controller.constructor, metadata.key),
                    viewMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerView, controller.constructor, metadata.key) || { viewName: this.defaultViewName }
                });
            }
        }
        return routeMap;
    }
}
