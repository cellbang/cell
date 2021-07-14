import { Component, Autowired, Prioritizeable, Value } from '@malagu/core';
import { RouteMetadataProvider, RouteMetadata, RouteMetadataConverterProvider, RedirectMetadata, ROUTE_METADATA } from './router-protocol';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PathResolver } from '../resolver';
import { DEFAULT_LAYOUT } from '../layout';

@Component(RouteMetadataProvider)
export class RouteMetadataProviderImpl implements RouteMetadataProvider {

    protected prioritized: (RouteMetadata | RedirectMetadata)[];

    @Autowired(ROUTE_METADATA)
    protected readonly routeMetadatas: (RouteMetadata | RedirectMetadata)[];

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(RouteMetadataConverterProvider)
    protected readonly routeMetadataConverterProvider: RouteMetadataConverterProvider;

    @Value('malagu.react.routes')
    protected readonly routes: any;

    @Autowired(DEFAULT_LAYOUT)
    protected readonly defaultLayout: React.ComponentType<any>;

    provide(): (RouteMetadata | RedirectMetadata)[] {
        if (!this.prioritized) {
            this.prioritized = this.parseRouteMetadatas();
        }
        return this.prioritized;
    }

    protected parseRouteMetadatas(): (RouteMetadata | RedirectMetadata)[] {
        const map = new Map<any, RouteMetadata>();
        for (const r of this.routeMetadatas) {
            if (RouteMetadata.is(r)) {
                map.set(r.component || r.render, r);
                r.children = r.children || [];
                if (r.isDefaultLayout && !r.layout && r.component !== this.defaultLayout && r.render !== this.defaultLayout) {
                    r.layout = this.defaultLayout;
                }
            }
        }

        for (const r of this.routeMetadatas) {

            let merged = r;
            if (!RedirectMetadata.is(merged)) {
                merged = this.getMergedConfig(merged);
            }
            for (const converter of this.routeMetadataConverterProvider.provide()) {
                merged = converter.convert(merged);
            }
            if (RouteMetadata.is(merged)) {
                if (merged.layout) {
                    const meta = { ...merged };
                    merged.render = (props: RouteComponentProps<any>) => this.renderLayout(map, props, meta);
                    delete merged.component;
                }
                if (Array.isArray(merged.path)) {
                    merged.path = merged.path.map(p => this.pathResolver.resolve(p));
                } else {
                    const temp = merged.path ? (Array.isArray(merged.path) ? merged.path : [merged.path]) : [];
                    merged.path = this.pathResolver.resolve(...temp);
                }
            } else {
                merged.from = this.pathResolver.resolve(merged.from || '');
                if (typeof merged.to === 'string') {
                    merged.to = this.pathResolver.resolve(merged.to);
                }
            }
        }

        return this.sort(this.routeMetadatas);

    }

    protected renderLayout(map: Map<any, RouteMetadata>, props: RouteComponentProps<any>, routeMetadata: RouteMetadata) {
        let current = routeMetadata.component || routeMetadata.render;
        let realLayout: React.ReactNode | undefined;
        while (current) {
            if (realLayout) {
                const C = current as any;
                realLayout = <C>{realLayout}</C>;
            } else {
                if (routeMetadata.component) {
                    const C = routeMetadata.component as any;
                    realLayout = <C {...props}/>;
                } else {
                    realLayout = routeMetadata.render!(props);
                    if (!realLayout) {
                        return;
                    }
                }
            }

            const r = map.get(current);
            if (r) {
                current = r.layout;
            } else {
                break;
            }
        }

        return realLayout;
    }

    protected sort(list: (RouteMetadata | RedirectMetadata)[]) {
        return Prioritizeable.prioritizeAllSync(list).map(c => c.value);
    }

    protected getMergedConfig(r: RouteMetadata): RouteMetadata {
        if (!this.routes) {
            return r;
        }
        const paths: string[] = Array.isArray(r.path) ? r.path : (r.path ? [r.path] : []);

        let merged = r;
        for (const p of paths) {
            merged = { ...merged, ...this.routes[p] };
        }

        return merged;
    }

}
