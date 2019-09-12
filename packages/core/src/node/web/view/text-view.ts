import { Component } from '../../../common/annotation';
import { View } from './view-protocol';
import { Context } from '../context';

@Component(View)
export class TextView implements View {

    static VIEW_NAME = 'text';

    readonly contentType = 'text/plain';

    readonly priority = 600;

    async render(model: any): Promise<void> {
        const response = Context.getCurrent().response;
        response.body = model;
    }

    support(viewName: string): Promise<boolean> {
        return Promise.resolve(viewName === TextView.VIEW_NAME);
    }
}
