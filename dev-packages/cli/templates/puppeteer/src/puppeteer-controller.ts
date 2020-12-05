import { Autowired } from '@malagu/core';
import { Context } from '@malagu/web/lib/node';
import { Controller, Get, Query, File } from '@malagu/mvc/lib/node';
import { BrowserProvider } from '@malagu/puppeteer';

@Controller()
export class PuppeteerController {

    @Autowired(BrowserProvider)
    protected readonly browserProvider: BrowserProvider;

    @Get('screenshot')
    @File()
    async screenshot(@Query('url') url?: string) {
        const response = Context.getResponse();
        response.attachment('download.png');
        const browser = await this.browserProvider.provide();
        const page = await browser.newPage();
        try {
            await page.goto(url || 'https://baidu.com', { waitUntil: 'networkidle0' });
            return await page.screenshot();
        } finally {
            await page.close();
        }
    }
}