import 'reflect-metadata';
import { VALUE } from './annotation/value';
import { ConfigProvider } from './config/config-protocol';
import { autoBind } from './container/auto-bind';
export * from './index';

export default autoBind(bind => {
    bind(VALUE).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const el = namedMetadata!.value.toString();
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        return configProvider.get(el);
    });
});
