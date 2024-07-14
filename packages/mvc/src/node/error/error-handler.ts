import { ErrorHandler, Context } from '@malagu/web/lib/node';
import { Component, Autowired, Value } from '@malagu/core';
import { JsonViewTemplateRenderer } from '../view/view-protocol';
import { HttpHeaders, MediaType } from '@malagu/http';

@Component(ErrorHandler)
export class JsonViewErrorHandler implements ErrorHandler {

    @Value('malagu.mvc.jsonView.errorHandler.priority?:2000')
    readonly priority: number;

    @Value('malagu.mvc.jsonView.errorHandler.enabled?:true')
    protected readonly enabled: boolean;

    @Autowired(JsonViewTemplateRenderer)
    protected readonly jsonViewTemplateRenderer: JsonViewTemplateRenderer;

    async canHandle(ctx: Context, err: Error): Promise<boolean> {
        return this.enabled;
    }

    async handle(ctx: Context, err: Error): Promise<void> {
        ctx.response.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_UTF8);
        ctx.response.end(await this.jsonViewTemplateRenderer.render(undefined, err));
    }
}

