import { autoBind } from '@celljs/core';
import { RestOperations, RestOperationsFactory } from './client';

export default autoBind(bind => {
    bind(RestOperations).toDynamicValue(ctx => {
        const factory = ctx.container.get<RestOperationsFactory>(RestOperationsFactory);
        return factory.create();
    }).inSingletonScope();

});
