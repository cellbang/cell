export * from '../common';
import 'reflect-metadata';
import { autoBind, ConfigProvider, VALUE } from '../common';
export * from '.';

export const CoreBackendModule = autoBind(bind => {
    bind(VALUE).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const el = namedMetadata!.value.toString();
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        return configProvider.get(el);
    });
});
