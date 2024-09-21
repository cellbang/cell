import { DefaultRegionProvider } from '@celljs/cloud/lib/node';
import { Component } from '@celljs/core';
import { RegionProvider } from '@celljs/cloud';

@Component({ id: RegionProvider, rebind: true })
export class FaaSRegionProvider extends DefaultRegionProvider {

    override async provide(): Promise<string | undefined> {
        const region = await super.provide();
        if (region) {
            return region;
        }
        return process.env.TENCENTCLOUD_REGION;
    }
}
