import { Component, Value } from '@celljs/core';
import { JsonViewTemplateRenderer } from './view-protocol';

@Component(JsonViewTemplateRenderer)
export class JsonViewTemplateRendererImpl implements JsonViewTemplateRenderer {

    @Value('cell.mvc.jsonView.template')
    protected readonly jsonViewTemplate?: string;

    async render(model?: any, error?: Error): Promise<string> {
        if (this.jsonViewTemplate) {
            return this.jsonViewTemplate
                .replace('{{model}}', JSON.stringify(model))
                .replace('{{error}}', error?.message ?? '')
                .replace('{{success}}', error ? 'false' : 'true')
                .replace('{{code}}', (error as any)?.code ?? (error as any)?.statusCode ?? '');
        }
        if (error) {
            throw error;
        }
        return JSON.stringify(model);
    }
}
