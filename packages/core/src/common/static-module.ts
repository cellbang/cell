import 'reflect-metadata';
import { autoBind, ConfigProvider, VALUE } from '.';
export * from '.';

export default autoBind(bind => {
    bind(VALUE).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const el = namedMetadata!.value.toString();
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        return configProvider.get(el);
    });
});
