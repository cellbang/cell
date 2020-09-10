import { autoBind } from '@malagu/core';
import { RestOperations, RestOperationsFactory } from './client';
import './resolver';

export default autoBind(bind => {
    bind(RestOperations).toFactory(ctx => {
        const factory = ctx.container.get<RestOperationsFactory>(RestOperationsFactory);
        return factory.create();
    });

});
