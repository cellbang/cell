import { Component } from '../../../common/annotation';
import { View } from './view-protocol';
import { Context } from '../context';

@Component(View)
export class JsonView implements View {

    static VIEW_NAME = 'json';

    readonly contentType = 'application/json';

    readonly priority = 500;

    async render(model: any): Promise<void> {
        const response = Context.getCurrent().response;
        response.body = model;
    }

    support(viewName: string): Promise<boolean> {
        return Promise.resolve(viewName === JsonView.VIEW_NAME);
    }
}
