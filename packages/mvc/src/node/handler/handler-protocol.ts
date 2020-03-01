import { StrOrRegex, ParamMetadata, BodyMetadata, QueryMetadata, RequestHeaderMetadata,
    ResponseHeaderMetadata, RequestCookieMetadata, ResponseCookieMetadata, RequestSessionMetadata,
    ResponseSessionMetadata, ViewMetadata, MethodMetadata, CatchMetadata, ControllerMetadata } from '../annotation';
import { ErrorType } from '@malagu/core';

export const MVC_HANDLER_ADAPTER_PRIORITY = 2000;

export const RouteProvider = Symbol('RouteProvider');
export const RouteMetadataMatcher = Symbol('RouteMetadataMatcher');

export interface Route {
    mapping: Map<string, Map<StrOrRegex, RouteMetadata>>;
    errorMapping: Map<ErrorType, RouteMetadata>;
}

export interface RouteMetadata {
    controllerMetadata: ControllerMetadata;
    methodMetadata: MethodMetadata | CatchMetadata;
    paramMetadata?: ParamMetadata[];
    bodyMetadata?: BodyMetadata[];
    queryMetadata?: QueryMetadata[];
    requestHeaderMetadata?: RequestHeaderMetadata[];
    responseHeaderMetadata?: ResponseHeaderMetadata[];
    requestCookieMetadata?: RequestCookieMetadata[];
    responseCookieMetadata?: ResponseCookieMetadata[];
    requestSessionMetadata?: RequestSessionMetadata[];
    responseSessionMetadata?: ResponseSessionMetadata[];
    viewMetadata: ViewMetadata;
}

export interface RouteProvider {
    provide(): Promise<Route>;
}

export interface RouteMetadataMatcher {
    match(error?: Error): Promise<RouteMetadata | undefined>;
}
