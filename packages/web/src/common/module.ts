import { autoBind } from '@malagu/core';
import { RestOperations, RestOperationsFactory } from './client';
import './resolver';

export default autoBind(bind => {
    bind(RestOperations).toDynamicValue(ctx => {
        const factory = ctx.container.get<RestOperationsFactory>(RestOperationsFactory);
        return factory.create();
    }).inSingletonScope();

});
