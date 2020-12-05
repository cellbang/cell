import { Component } from '@malagu/core';
import { View } from './view-protocol';
import { Context } from '@malagu/web/lib/node';
import { ViewMetadata } from '../annotation/view';
import { TEXT_VIEW_NAME } from '../annotation/text';

@Component(View)
export class TextView implements View {

    readonly contentType = 'text/plain';

    readonly priority = 600;

    async render(model: any, metadata: ViewMetadata): Promise<void> {
        const response = Context.getCurrent().response;
        response.body = model;
    }

    support({ viewName }: ViewMetadata): Promise<boolean> {
        return Promise.resolve(viewName === TEXT_VIEW_NAME);
    }
}
