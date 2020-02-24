import { Component } from '@malagu/core';
import { View } from './view-protocol';
import { Context } from '@malagu/web/lib/node';

@Component(View)
export class JsonView implements View {

    static VIEW_NAME = 'json';

    readonly contentType = 'application/json';

    readonly priority = 500;

    async render(model: any, viewName: string): Promise<void> {
        const response = Context.getCurrent().response;
        response.body = JSON.stringify(model);
    }

    support(viewName: string): Promise<boolean> {
        return Promise.resolve(viewName === JsonView.VIEW_NAME);
    }
}
