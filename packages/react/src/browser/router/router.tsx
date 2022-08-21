import * as React from 'react';
import { RouteMetadataProvider } from './router-protocol';
import { useRoutes, BrowserRouter, HashRouter, RouteObject } from 'react-router-dom';
import { Router } from '../annotation';
import { ConfigUtil, ContainerUtil } from '@malagu/core';

const routerMap = {
    browser: BrowserRouter,
    hash: HashRouter
};

const RouteComponent = () => {
    const element = useRoutes(buildRoutes());
    return element;
};

const RouterComponent = () => {
    const routerType = ConfigUtil.get<'browser' | 'hash'>('malagu.react.router.type');
    return React.createElement(routerMap[routerType], {}, React.createElement(RouteComponent));
};

const buildRoutes = (): RouteObject[] => {
    const routeMetadataProvider = ContainerUtil.get<RouteMetadataProvider>(RouteMetadataProvider);
    return routeMetadataProvider.provide().map(metadata => {
        // eslint-disable-next-line no-null/no-null
        let element: React.ReactNode | null;
        if (metadata.component) {
            if (metadata.layout) {
                element = React.createElement(metadata.layout, {}, React.createElement(metadata.component));
            } else {
                element = React.createElement(metadata.component);
            }
        }
        return {
            path: metadata.path,
            index: metadata.index,
            caseSensitive: metadata.caseSensitive,
            element
        };
    });
};

@Router(RouterComponent, false)
export default class {}
