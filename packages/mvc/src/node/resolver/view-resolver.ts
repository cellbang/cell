import { ViewResolver } from './resolver-protocol';
import { Component, Autowired, Value } from '@malagu/core';
import { ViewProvider } from '../view/view-provider';
import { ViewMetadata } from '../annotation/view';
import { Context } from '@malagu/web/lib/node';

@Component(ViewResolver)
export class ViewResolverImpl implements ViewResolver {

    @Value('malagu.mvc.defaultViewName')
    protected readonly defaultViewName: string;

    @Autowired
    protected readonly viewProvider: ViewProvider;

    async resolve(metadata: any, model: any): Promise<void> {
        const viewMetadata = <ViewMetadata>metadata.viewMetadata;
        const viewName = viewMetadata.viewName || this.defaultViewName;
        for (const view of this.viewProvider.provide()) {
            if (await view.support(viewName)) {
                Context.getResponse().setHeader('Content-type', view.contentType);
                await view.render(model, viewName);
                return;
            }
        }
        throw new Error('Not found a suitable view.');
    }
}
