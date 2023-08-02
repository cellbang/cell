import './index';
import { VALUE } from './annotation/value';
import { PROVIDER, ID_KEY } from './annotation/autowired-provider';
import { ConfigProvider } from './config/config-protocol';
import { autoBind } from './container/auto-bind';
import { ProviderCreator } from './provider/provider-protocol';
import { ComponentId } from './annotation/component';

export default autoBind(bind => {
    bind(VALUE).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const el = namedMetadata!.value.toString();
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        return configProvider.get(el);
    });

    bind(PROVIDER).toDynamicValue(ctx => {
        const id = ctx.currentRequest.target.getCustomTags()?.find(m => m.key === ID_KEY)!.value as ComponentId;
        const providerCreator = ctx.container.get<ProviderCreator<any>>(ProviderCreator);

        return providerCreator.create(id, ctx.container);
    });
});
