import { ConfigContext } from '@malagu/cli';
import { DefaultProfileProvider, FaaSAdapterUtils, FaaSAdapterConfiguration } from '@malagu/faas-adapter/lib/hooks';

export default async (context: ConfigContext) => {
    const { config, cfg } = context;
    if (config.mode && config.mode.includes('remote')) {
        const adapterConfig = FaaSAdapterUtils.getConfiguration<FaaSAdapterConfiguration>(cfg);
        const profileProvider = new DefaultProfileProvider();
        const profile = await profileProvider.provide(adapterConfig, true);
        const faasAdapter = config.malagu['faas-adapter'];
        if (!faasAdapter.account?.id) {
            faasAdapter.account = profile.account;
        }
        if (!faasAdapter.region) {
            faasAdapter.region = profile.region;
        }
    }
};
