import { Component, Autowired } from '@malagu/core';
import { RouteMetadataConverter, RouteMetadata, RedirectMetadata } from '@malagu/react/lib/browser';
import { MainLayout, MinimalLayout } from './layout-provider';
import * as React from 'react';

@Component(RouteMetadataConverter)
export class RouteMetadataConverterImpl implements RouteMetadataConverter {

    @Autowired(MainLayout)
    protected readonly MainLayout: any;

    @Autowired(MinimalLayout)
    protected readonly MinimalLayout: any;

    priority: number = 1000;

    async convert(metadata: RouteMetadata | RedirectMetadata): Promise<RouteMetadata | RedirectMetadata> {
        if (!RedirectMetadata.is(metadata) && !metadata.render) {
            const Child: any = metadata.component;
            metadata.render = () => (
                <this.MainLayout>
                    <Child/>
                </this.MainLayout>
            );
            delete metadata.component;
        }
        return metadata;
    }

}
