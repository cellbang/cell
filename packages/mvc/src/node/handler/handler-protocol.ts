import {
    StrOrRegex,
    ParamMetadata,
    RequestMetadata,
    QueryMetadata,
    RequestHeaderMetadata,
    ResponseHeaderMetadata,
    RequestCookieMetadata,
    ResponseCookieMetadata,
    RequestSessionMetadata,
    ResponseSessionMetadata,
    ViewMetadata,
    MethodMetadata,
    CatchMetadata,
    ControllerMetadata,
    BodyMetadata,
    ResponseMetadata,
} from '../annotation';
import { ErrorType } from '@celljs/core';

export const MVC_HANDLER_ADAPTER_PRIORITY = 2000;

export const RouteProvider = Symbol('RouteProvider');
export const RouteMetadataMatcher = Symbol('RouteMetadataMatcher');

export interface Route {
    mapping: Map<string, PathRouteMetadata[]>;
    errorMapping: Map<ErrorType, ErrorRouteMetadata>;
}

export interface RouteMetadata {
    controllerMetadata: ControllerMetadata;
    methodMetadata: MethodMetadata | CatchMetadata;
    requestMetadata?: RequestMetadata;
    responseMetadata?: ResponseMetadata;
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

export interface PathRouteMetadata extends RouteMetadata {
    path: StrOrRegex;
}

export interface ErrorRouteMetadata extends RouteMetadata {
    errorType: ErrorType;
}

export interface RouteProvider {
    provide(): Promise<Route>;
}

export interface RouteMetadataMatcher {
    match(error?: Error): Promise<RouteMetadata | undefined>;
}
