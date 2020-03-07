import { Component, Value } from '@malagu/core';
import { View } from './view-protocol';
import { Context } from '@malagu/web/lib/node';
import { render, parse } from 'mustache';
import { join } from 'path';
import { readFileSync } from 'fs-extra';

@Component(View)
export class HtmlView implements View {

    readonly contentType = 'text/html';

    readonly priority = 500;

    @Value('malagu.mustache')
    protected readonly options: any;

    async render(model: any, viewName: string): Promise<void> {
        const response = Context.getCurrent().response;
        const { baseViewDir, cache } = this.options;
        const template = readFileSync(join(__dirname, baseViewDir, viewName), { encoding: 'utf8' });
        if (cache) {
            parse(template);
        }
        response.body = render(template, model);
    }

    support(viewName: string): Promise<boolean> {
        return Promise.resolve(viewName.endsWith('.mustache'));
    }
}
