import { Component, Value } from '@malagu/core';
import { RegionProvider } from '../common';

@Component(RegionProvider)
export class DefaultRegionProvider implements RegionProvider {

    @Value('malagu.cloud.region')
    protected readonly region: string;

    async provide(): Promise<string | undefined> {
        return this.region;
    }
}
