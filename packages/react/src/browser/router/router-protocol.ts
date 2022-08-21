export const ROUTER = Symbol('Router');
export const ROUTE_METADATA = Symbol('ROUTE_METADATA');

export const RouteMetadataProvider = Symbol('RouteMetadataProvider');
export const RouteMetadataConverter = Symbol('RouteMetadataConverter');
export const RouteMetadataConverterProvider = Symbol('RouteMetadataConverterProvider');

export interface RouteMetadata {
    caseSensitive?: boolean;
    index?: boolean;
    path?: string;
    component?: React.ComponentType;
    layout?: React.ComponentType;
    priority?: number;
}

export interface RouteMetadataConverter {
    readonly priority: number;
    convert(metadata: RouteMetadata): RouteMetadata;
}

export interface RouteMetadataConverterProvider {
    provide(): RouteMetadataConverter[];
}

export interface RouteMetadataProvider {
    provide(): RouteMetadata[];
}
