import { RouteProps, RedirectProps } from 'react-router';

export const ROUTER = Symbol('Router');
export const ROUTE_METADATA = Symbol('ROUTE_METADATA');

export const RouteMetadataProvider = Symbol('RouteMetadataProvider');
export const RouteMetadataConverter = Symbol('RouteMetadataConverter');
export const RouteMetadataConverterProvider = Symbol('RouteMetadataConverterProvider');

export interface RouteMetadata extends RouteProps {
    isDefaultLayout?: boolean;
    layout?: React.ComponentType<any>;
    priority?: number;
}

export namespace RouteMetadata {
    export function is(metadata: any): metadata is RouteMetadata {
        return !!!metadata.to;
    }
}

export interface RedirectMetadata extends RedirectProps {
    isDefaultLayout?: boolean;
    priority?: number;
}

export namespace RedirectMetadata {
    export function is(metadata: any): metadata is RedirectMetadata {
        return !!metadata.to;
    }
}

export interface RouteMetadataProvider {
    provide(): (RouteMetadata | RedirectMetadata)[];
}

export interface RouteMetadataConverter {
    readonly priority: number;
    convert(metadata: RouteMetadata | RedirectMetadata): RouteMetadata | RedirectMetadata;
}

export interface RouteMetadataConverterProvider {
    provide(): RouteMetadataConverter[];
}
