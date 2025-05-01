import { Autowired, Component, Logger } from '@celljs/core';
import * as puppeteer from 'puppeteer-core';
import { BrowserInstaller, BrowserProvider } from './puppeteer-protocol';

@Component(BrowserProvider)
export class BrowserProviderImpl implements BrowserProvider {

    @Autowired(Logger)
    protected readonly logger: Logger;

    @Autowired(BrowserInstaller)
    protected readonly browserInstaller: BrowserInstaller;

    protected browser: puppeteer.Browser;

    protected async isBrowserAvailable() {
        try {
            await this.browser.version();
        } catch (e) {
            this.logger.debug(e);
            return false;
        }
        return true;
    }

    async provide(): Promise<puppeteer.Browser> {
        if (!this.browser || !await this.isBrowserAvailable()) {
            const launchOptions = await this.browserInstaller.install();
            this.browser = await puppeteer.launch(launchOptions);
            this.logger.debug(`launch done: ${await this.browser.version()}`);
        }
        return this.browser;
    }
}
