import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';
import { BACKEND_TARGET } from '@malagu/cli-common/lib/constants';
import { LaunchOptions } from 'puppeteer-core';
import { BrowserFetcher } from 'puppeteer-core/lib/cjs/puppeteer/node/BrowserFetcher';
import { PUPPETEER_REVISIONS } from 'puppeteer-core/lib/cjs/puppeteer/revisions';
import * as ora from 'ora';
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';

export async function before(ctx: CliContext) {
    const { cfg } = ctx;
    const launchOptions = <LaunchOptions>ConfigUtil.getMalaguConfig(cfg, BACKEND_TARGET).puppeteer.launchOptions;
    if (!launchOptions.executablePath) {
        const browserFetcher = new BrowserFetcher(process.cwd());
        const product = launchOptions.product || 'chromium';
        const revision = product === 'firefox' ? PUPPETEER_REVISIONS.firefox : PUPPETEER_REVISIONS.chromium;
        const spinner = ora('Downloading browser binary...').start();
        try {
            const info = await browserFetcher.download(revision, (download, total) => {
                spinner.text = `Downloading browser binary ${(download * 100.0 / total).toFixed(2)}%`;
            });
            spinner.succeed(`Download browser binary complete: ${info?.folderPath}`);
        } catch (error) {
            spinner.fail(error);
        }
    }
};
