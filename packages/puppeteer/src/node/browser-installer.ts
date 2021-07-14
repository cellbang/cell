import { ObjectStorageService, RawCloudService } from '@malagu/cloud';
import { Autowired, Component, Value } from '@malagu/core';
import { LaunchOptions } from 'puppeteer-core';
import { BrowserInstaller, PuppeteerConfig } from './puppeteer-protocol';
const tar = require('tar');

@Component(BrowserInstaller)
export class DefaultBrowserInstaller implements BrowserInstaller {

    @Value('malagu.puppeteer')
    protected readonly config: PuppeteerConfig;

    @Autowired(ObjectStorageService)
    protected readonly objectStorageService: ObjectStorageService<RawCloudService>;

    async install(): Promise<LaunchOptions> {
        const { bucket, key, launchOptions, libPath, setupPath } = this.config;
        if (bucket && launchOptions.headless) {

            const stream = await this.objectStorageService.getStream({ bucket, key });
            await new Promise<void>((resolve, reject) => {
                stream.pipe(tar.x({
                    C: setupPath,
                }))
                .on('error', (err: any) => reject(err))
                .on('end', () => resolve());
            });
        }

        return {
            env: {
                ...libPath ? { LD_LIBRARY_PATH: `${process.env['LD_LIBRARY_PATH']}:${libPath}` } : {}
            }, ...launchOptions
        };
    }

}
