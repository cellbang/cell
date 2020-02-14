import '../common';
import { autoBind, ConfigProvider, VALUE } from '../common';
export * from '.';

export const CoreFrontendModule = autoBind(bind => {
    bind(VALUE).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const el = namedMetadata!.value.toString();
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        return configProvider.get(el);
    });

});
