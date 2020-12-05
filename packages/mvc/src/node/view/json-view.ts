import { Component } from '@malagu/core';
import { View } from './view-protocol';
import { Context } from '@malagu/web/lib/node';
import { ViewMetadata } from '../annotation/view';
import { JSON_VIEW_NAME } from '../annotation/json';

@Component(View)
export class JsonView implements View {

    readonly contentType = 'application/json';

    readonly priority = 500;

    async render(model: any, metadata: ViewMetadata): Promise<void> {
        const response = Context.getCurrent().response;
        response.body = JSON.stringify(model);
    }

    support({ viewName }: ViewMetadata): Promise<boolean> {
        return Promise.resolve(viewName === JSON_VIEW_NAME);
    }
}
