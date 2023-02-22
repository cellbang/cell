import { DefaultRegionProvider } from '@malagu/cloud/lib/node';
import { Component } from '@malagu/core';
import { RegionProvider } from '@malagu/cloud';

@Component({ id: RegionProvider, rebind: true })
export class FaaSRegionProvider extends DefaultRegionProvider {

    override async provide(): Promise<string | undefined> {
        const region = await super.provide();
        if (region) {
            return region;
        }
        return process.env.AWS_REGION;
    }
}
