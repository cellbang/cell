import { History } from 'history';
import { RouteProps, RedirectProps } from 'react-router';

export const App = Symbol('App');
export const Router = Symbol('Router');
export const RouteMetadata = Symbol('RouteMetadata');
export const RouteMetadataProvider = Symbol('RouteMetadataProvider');
export const Context = Symbol('Context');
export const ContextProvider = Symbol('ContextProvider');
export const HistoryProvider = Symbol('HistoryProvider');
export const RouteMetadataConverter = Symbol('RouteMetadataConverter');
export const RouteMetadataConverterProvider = Symbol('RouteMetadataConverterProvider');

export interface Element extends React.Component<any, any> {}

export interface App extends Element {}

export interface Router extends Element {}

export interface RouteMetadata extends RouteProps {
    priority?: number;
}

export interface RedirectMetadata extends RedirectProps {
    priority?: number;
}

export namespace RedirectMetadata {
    export function is(metadata: any): metadata is RedirectMetadata {
        return !!metadata.to;
    }
}

export interface RouteMetadataProvider {
    provide(): Promise<(RouteMetadata | RedirectMetadata)[]>;
}

export interface Context extends Element {
}

export interface ContextProvider {
    provide(): Promise<(new() => Context)[]>;
}

export interface HistoryProvider  {
    provide(): History
}

export interface RouteMetadataConverter {
    readonly priority: number;
    convert(metadata: RouteMetadata | RedirectMetadata): Promise<RouteMetadata | RedirectMetadata>;
}

export interface RouteMetadataConverterProvider {
    provide(): Promise<RouteMetadataConverter[]>;
}
