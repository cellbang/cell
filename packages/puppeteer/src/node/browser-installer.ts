import { Component, Value } from '@malagu/core';
import { LaunchOptions } from 'puppeteer-core';
import { BrowserInstaller, PuppeteerConfig } from './puppeteer-protocol';
const OSS = require('ali-oss').Wrapper;
const tar = require('tar');

@Component(BrowserInstaller)
export class DefaultBrowserInstaller implements BrowserInstaller {

    @Value('malagu.puppeteer')
    protected readonly config: PuppeteerConfig;

    async install(): Promise<LaunchOptions> {
        const { internal, region, accessKeyId, accessKeySecret, stsToken, bucket, object, launchOptions, libPath, setupPath } = this.config;
        if (bucket && launchOptions.headless) {
            const client = new OSS({
                internal: internal,
                region: region,
                accessKeyId: accessKeyId,
                accessKeySecret: accessKeySecret,
                stsToken: stsToken,
                bucket: bucket,
            });
            const { stream } = await client.getStream(object);
            await new Promise((resolve, reject) => {
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
