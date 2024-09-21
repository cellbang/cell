import { Component, Value } from '@celljs/core';
import { View } from './view-protocol';
import { Context } from '@celljs/web/lib/node';
import { parse, render } from 'mustache';
import { join } from 'path';
import { readFile } from 'fs-extra';
import { ViewMetadata } from '../annotation/view';
import { HTML_VIEW_NAME } from '../annotation/html';
import { MediaType } from '@celljs/http';

@Component(View)
export class HtmlView implements View {

    readonly contentType = MediaType.TEXT_HTML;

    readonly priority = 500;

    @Value('cell.mustache')
    protected readonly options: any;

    async render(model: any, { metadata }: ViewMetadata): Promise<void> {
        const response = Context.getCurrent().response;
        const { baseViewDir, cache } = this.options;
        const template = await readFile(join(__dirname, baseViewDir, metadata!.file), { encoding: 'utf8' });
        if (cache) {
            parse(template);
        }
        response.body = render(template, model);
    }

    support({ viewName, metadata }: ViewMetadata): Promise<boolean> {
        return Promise.resolve(viewName === HTML_VIEW_NAME && metadata?.file?.endsWith('.mustache'));
    }
}
