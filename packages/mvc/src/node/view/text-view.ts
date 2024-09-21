import { Component } from '@celljs/core';
import { View } from './view-protocol';
import { Context } from '@celljs/web/lib/node';
import { ViewMetadata } from '../annotation/view';
import { TEXT_VIEW_NAME } from '../annotation/text';
import { MediaType } from '@celljs/http';

@Component(View)
export class TextView implements View {

    readonly contentType = MediaType.TEXT_PLAIN;

    readonly priority = 600;

    async render(model: any, metadata: ViewMetadata): Promise<void> {
        const response = Context.getCurrent().response;
        response.body = model;
    }

    support({ viewName }: ViewMetadata): Promise<boolean> {
        return Promise.resolve(viewName === TEXT_VIEW_NAME);
    }
}
