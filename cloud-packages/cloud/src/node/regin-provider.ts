import { Component, Value } from '@celljs/core';
import { RegionProvider } from '../common';

@Component(RegionProvider)
export class DefaultRegionProvider implements RegionProvider {

    @Value('cell.cloud.region')
    protected readonly region: string;

    async provide(): Promise<string | undefined> {
        return this.region;
    }
}
