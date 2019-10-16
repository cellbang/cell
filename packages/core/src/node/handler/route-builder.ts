import { Component, Autowired, Optional, Value } from '../../common/annotation';
import { CONTROLLER, ControllerMetadata } from '../annotation/controller';
import { METADATA_KEY } from '../constants';
import { StrOrRegex, MethodMetadata } from '../annotation/method';
import { PathResolver } from '../../common';
import { ErrorType } from '../error';
import { CatchMetadata } from '../annotation';

@Component()
export class RouteBuilder {

    @Autowired(CONTROLLER) @Optional
    protected readonly controllers: any[] = [];

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value('malagu.mvc.defaultViewName')
    protected readonly defaultViewName: string;

    async build() {
        const mapping: Map<string, Map<StrOrRegex, any>> = new Map<string, Map<StrOrRegex, any>>();
        const errorMapping: Map<ErrorType, any> = new Map<ErrorType, any>();

        for (const controller of this.controllers) {
            const targetConstructor = controller.target ? controller.target.constructor : controller.constructor;

            const controllerMetadata = <ControllerMetadata>Reflect.getOwnMetadata(METADATA_KEY.controller, targetConstructor);
            await this.doBuildRouteMap(mapping, targetConstructor, controller, controllerMetadata);
            await this.doBuildErrorRouteMap(errorMapping, targetConstructor, controller, controllerMetadata);

        }
        return {
            mapping,
            errorMapping
        };
    }

    protected async doBuildRouteMap(mapping: Map<string, Map<StrOrRegex, any>>, targetConstructor: any, controller: any, controllerMetadata: ControllerMetadata) {
        const methodMetadata: MethodMetadata[] = Reflect.getOwnMetadata(
            METADATA_KEY.controllerMethod,
            targetConstructor
        ) || [];
        for (const metadata of methodMetadata) {
            const routeOptions: any = (typeof metadata.options === 'string' || metadata.options instanceof RegExp) ? { path: metadata.options } : metadata.options;
            const method = metadata.method;
            metadata.target = controller;
            let pathMap = mapping.get(method);
            if (!pathMap) {
                pathMap = new Map<StrOrRegex, any>();
                mapping.set(method, pathMap);
            }
            let path: StrOrRegex = routeOptions.path;
            if (typeof path === 'string' ) {
                path = await this.pathResolver.resolve(controllerMetadata.path, path);
            } else if (path instanceof RegExp) {
                if (controllerMetadata.path) {
                    path = new RegExp(await this.pathResolver.resolve(controllerMetadata.path, path.source));
                }
            }
            pathMap.set(path, {
                controllerMetadata,
                methodMetadata: metadata,
                ...this.doRouteMetadata(targetConstructor, metadata.key)
            });
        }
    }

    protected async doBuildErrorRouteMap(errorMapping: Map<ErrorType, any>, targetConstructor: any, controller: any, controllerMetadata: ControllerMetadata) {
        const methodMetadata: CatchMetadata[] = Reflect.getOwnMetadata(
            METADATA_KEY.controllerCatch,
            targetConstructor
        ) || [];
        for (const metadata of methodMetadata) {
            metadata.target = controller;
            for (const errorType of metadata.errorTypes) {
                errorMapping.set(errorType, {
                    controllerMetadata,
                    methodMetadata: metadata,
                    ...this.doRouteMetadata(targetConstructor, metadata.key)
                });
            }
        }
    }

    protected doRouteMetadata(targetConstructor: any, method: string) {
        return {
            paramMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerParam, targetConstructor, method),
            bodyMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerBody, targetConstructor, method),
            queryMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerQuery, targetConstructor, method),
            requestHeaderMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestHeader, targetConstructor, method),
            responseHeaderMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseHeader, targetConstructor, method),
            requestCookieMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestCookie, targetConstructor, method),
            responseCookieMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseCookie, targetConstructor, method),
            requestSessionMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerRequestSession, targetConstructor, method),
            responseSessionMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerResponseSession, targetConstructor, method),
            viewMetadata: Reflect.getOwnMetadata(METADATA_KEY.controllerView, targetConstructor, method) || { viewName: this.defaultViewName }
        };
    }
}
