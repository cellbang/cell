import { Autowired, Component, Logger } from '@malagu/core';
import { launch, Browser } from 'puppeteer-core';
import { BrowserInstaller, BrowserProvider } from './puppeteer-protocol';

@Component(BrowserProvider)
export class BrowserProviderImpl implements BrowserProvider {

    @Autowired(Logger)
    protected readonly logger: Logger;

    @Autowired(BrowserInstaller)
    protected readonly browserInstaller: BrowserInstaller;

    protected browser: Browser;

    protected async isBrowserAvailable() {
        try {
            await this.browser.version();
        } catch (e) {
            this.logger.debug(e);
            return false;
        }
        return true;
    };

    async provide(): Promise<Browser> {
        if (!this.browser || !await this.isBrowserAvailable()) {
            const launchOptions = await this.browserInstaller.install();
            this.browser = await launch(launchOptions);
            this.logger.debug(`launch done: ${await this.browser.version()}`);
        }
        return this.browser;
    }
}
