import { CONTROLLER, ControllerMetadata } from '../annotation/controller';
import { METADATA_KEY } from '../constants';
import { StrOrRegex, MethodMetadata } from '../annotation/method';
import { getOwnMetadata, Component, Autowired, Optional, ErrorType } from '@malagu/core';
import { PathResolver } from '@malagu/web';
import { CatchMetadata } from '../annotation';
import { RouteMetadata } from './handler-protocol';
import { getTargetClass } from '@malagu/core/lib/common/utils/proxy-util';

@Component()
export class RouteBuilder {

    @Autowired(CONTROLLER) @Optional
    protected readonly controllers: any[] = [];

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    async build() {
        const mapping: Map<string, Map<StrOrRegex, RouteMetadata>> = new Map<string, Map<StrOrRegex, any>>();
        const errorMapping: Map<ErrorType, any> = new Map<ErrorType, RouteMetadata>();

        for (const controller of this.controllers) {
            const targetConstructor = getTargetClass(controller);

            const controllerMetadata = <ControllerMetadata>Reflect.getOwnMetadata(METADATA_KEY.controller, targetConstructor);
            await this.doBuildRouteMap(mapping, targetConstructor, controller, controllerMetadata);
            await this.doBuildErrorRouteMap(errorMapping, targetConstructor, controller, controllerMetadata);

        }
        return {
            mapping,
            errorMapping
        };
    }

    protected async doBuildRouteMap(mapping: Map<string, Map<StrOrRegex, RouteMetadata>>, targetConstructor: any, controller: any, controllerMetadata: ControllerMetadata) {

        const methodMetadata: MethodMetadata[] = getOwnMetadata(
            METADATA_KEY.controllerMethod,
            targetConstructor
        );
        for (const metadata of methodMetadata) {
            const routeOptions: any = (typeof metadata.options === 'string' || metadata.options instanceof RegExp) ? { path: metadata.options } : metadata.options;
            const m = { ...metadata };
            const method = m.method;
            m.target = controller;
            let pathMap = mapping.get(method);
            if (!pathMap) {
                pathMap = new Map<StrOrRegex, RouteMetadata>();
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
                methodMetadata: m,
                ...this.doRouteMetadata(targetConstructor, m.key)
            });
        }
    }

    protected async doBuildErrorRouteMap(errorMapping: Map<ErrorType, RouteMetadata>, targetConstructor: any, controller: any, controllerMetadata: ControllerMetadata) {
        const methodMetadata: CatchMetadata[] = getOwnMetadata(
            METADATA_KEY.controllerCatch,
            targetConstructor
        );
        for (const metadata of methodMetadata) {
            const m = { ...metadata };
            m.target = controller;
            for (const errorType of metadata.errorTypes) {
                errorMapping.set(errorType, {
                    controllerMetadata,
                    methodMetadata: m,
                    ...this.doRouteMetadata(targetConstructor, m.key)
                });
            }
        }
    }

    protected doRouteMetadata(targetConstructor: any, method: string) {
        return {
            paramMetadata: getOwnMetadata(METADATA_KEY.controllerParam, targetConstructor, method),
            bodyMetadata: getOwnMetadata(METADATA_KEY.controllerBody, targetConstructor, method),
            queryMetadata: getOwnMetadata(METADATA_KEY.controllerQuery, targetConstructor, method),
            requestHeaderMetadata: getOwnMetadata(METADATA_KEY.controllerRequestHeader, targetConstructor, method),
            responseHeaderMetadata: getOwnMetadata(METADATA_KEY.controllerResponseHeader, targetConstructor, method),
            requestCookieMetadata: getOwnMetadata(METADATA_KEY.controllerRequestCookie, targetConstructor, method),
            responseCookieMetadata: getOwnMetadata(METADATA_KEY.controllerResponseCookie, targetConstructor, method),
            requestSessionMetadata: getOwnMetadata(METADATA_KEY.controllerRequestSession, targetConstructor, method),
            responseSessionMetadata: getOwnMetadata(METADATA_KEY.controllerResponseSession, targetConstructor, method),
            viewMetadata: getOwnMetadata(METADATA_KEY.controllerView, targetConstructor, method) || { }
        };
    }
}
