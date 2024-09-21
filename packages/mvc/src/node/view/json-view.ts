import { Autowired, Component } from '@celljs/core';
import { JsonViewTemplateRenderer, View } from './view-protocol';
import { Context } from '@celljs/web/lib/node';
import { ViewMetadata } from '../annotation/view';
import { JSON_VIEW_NAME } from '../annotation/json';
import { MediaType } from '@celljs/http';

@Component(View)
export class JsonView implements View {

    readonly contentType = MediaType.APPLICATION_JSON_UTF8;

    readonly priority = 500;

    @Autowired(JsonViewTemplateRenderer)
    protected readonly jsonViewTemplateRenderer: JsonViewTemplateRenderer;

    async render(model: any, metadata: ViewMetadata): Promise<void> {
        const response = Context.getCurrent().response;
        response.body = await this.jsonViewTemplateRenderer.render(model);
    }

    support({ viewName }: ViewMetadata): Promise<boolean> {
        return Promise.resolve(viewName === JSON_VIEW_NAME);
    }
}
