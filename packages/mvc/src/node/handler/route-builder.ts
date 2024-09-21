import { CONTROLLER, ControllerMetadata } from '../annotation/controller';
import { METADATA_KEY } from '../constants';
import { StrOrRegex, MethodMetadata } from '../annotation/method';
import { getOwnMetadata, Component, Autowired, Optional, ErrorType, Prioritizeable, getTargetClass } from '@celljs/core';
import { PathResolver } from '@celljs/web';
import { CatchMetadata } from '../annotation';
import { PathRouteMetadata, ErrorRouteMetadata } from './handler-protocol';

@Component()
export class RouteBuilder {

    @Autowired(CONTROLLER) @Optional()
    protected readonly controllers: any[] = [];

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    async build() {
        const mapping: Map<string, PathRouteMetadata[]> = new Map<string, PathRouteMetadata[]>();
        const errorMapping: Map<ErrorType, any> = new Map<ErrorType, ErrorRouteMetadata>();

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

    protected async doBuildRouteMap(mapping: Map<string, PathRouteMetadata[]>, targetConstructor: any, controller: any, controllerMetadata: ControllerMetadata) {
        const methodMetadata: MethodMetadata[] = getOwnMetadata(
            METADATA_KEY.controllerMethod,
            targetConstructor
        );
        for (const metadata of methodMetadata) {
            const routeOptions: any = (typeof metadata.options === 'string' || metadata.options instanceof RegExp) ? { path: metadata.options } : metadata.options;
            const m = { ...metadata };
            const method = m.method;
            m.target = controller;
            let paths = mapping.get(method);
            if (!paths) {
                paths = [];
                mapping.set(method, paths);
            }
            let path: StrOrRegex = routeOptions.path;
            if (typeof path === 'string' ) {
                path = await this.pathResolver.resolve(controllerMetadata.path, path);
            } else if (path instanceof RegExp) {
                if (controllerMetadata.path) {
                    path = new RegExp(await this.pathResolver.resolve(controllerMetadata.path, path.source));
                }
            }
            const routeMetadata = {
                path,
                controllerMetadata,
                methodMetadata: m,
                ...this.doRouteMetadata(targetConstructor, m.key.toString())
            };
            paths.push(routeMetadata);
        }

        for (const [method, paths] of mapping) {
            const sorted = Prioritizeable.prioritizeAllSync(paths, value => {
                if (value.path instanceof RegExp) {
                    return Number.MIN_SAFE_INTEGER + value.path.toString().length;
                } else if (value.path.includes('*')) {
                    return value.path.replace('*', '').length;
                }
                return value.path.length + 1;
            }).map(({ value }) => value);
            mapping.set(method, sorted);
        }
    }

    protected async doBuildErrorRouteMap(errorMapping: Map<ErrorType, ErrorRouteMetadata>, targetConstructor: any, controller: any, controllerMetadata: ControllerMetadata) {
        const methodMetadata: CatchMetadata[] = getOwnMetadata(
            METADATA_KEY.controllerCatch,
            targetConstructor
        );
        for (const metadata of methodMetadata) {
            const m = { ...metadata };
            m.target = controller;
            for (const errorType of metadata.errorTypes) {
                errorMapping.set(errorType, {
                    errorType,
                    controllerMetadata,
                    methodMetadata: m,
                    ...this.doRouteMetadata(targetConstructor, m.key.toString())
                });
            }
        }
    }

    protected doRouteMetadata(targetConstructor: any, method: string) {
        const viewMetadata = getOwnMetadata(METADATA_KEY.controllerView, targetConstructor, method);
        const requestMetadata = getOwnMetadata(METADATA_KEY.controllerRequest, targetConstructor, method);
        const responseMetadata = getOwnMetadata(METADATA_KEY.controllerResponse, targetConstructor, method);
        return {
            requestMetadata: requestMetadata[0],
            responseMetadata: responseMetadata[0],
            paramMetadata: getOwnMetadata(METADATA_KEY.controllerParam, targetConstructor, method),
            bodyMetadata: getOwnMetadata(METADATA_KEY.controllerBody, targetConstructor, method),
            queryMetadata: getOwnMetadata(METADATA_KEY.controllerQuery, targetConstructor, method),
            requestHeaderMetadata: getOwnMetadata(METADATA_KEY.controllerRequestHeader, targetConstructor, method),
            responseHeaderMetadata: getOwnMetadata(METADATA_KEY.controllerResponseHeader, targetConstructor, method),
            requestCookieMetadata: getOwnMetadata(METADATA_KEY.controllerRequestCookie, targetConstructor, method),
            responseCookieMetadata: getOwnMetadata(METADATA_KEY.controllerResponseCookie, targetConstructor, method),
            requestSessionMetadata: getOwnMetadata(METADATA_KEY.controllerRequestSession, targetConstructor, method),
            responseSessionMetadata: getOwnMetadata(METADATA_KEY.controllerResponseSession, targetConstructor, method),
            viewMetadata:  viewMetadata.length ? viewMetadata[0] : {}
        };
    }
}
