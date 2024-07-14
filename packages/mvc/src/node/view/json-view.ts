import { Autowired, Component } from '@malagu/core';
import { JsonViewTemplateRenderer, View } from './view-protocol';
import { Context } from '@malagu/web/lib/node';
import { ViewMetadata } from '../annotation/view';
import { JSON_VIEW_NAME } from '../annotation/json';
import { MediaType } from '@malagu/http';

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
