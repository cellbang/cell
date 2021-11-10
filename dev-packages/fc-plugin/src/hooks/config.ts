import { ConfigContext } from '@malagu/cli-service';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';

export default async (context: ConfigContext) => {
    const { config, cfg } = context;
    if (config.mode && config.mode.includes('remote')) {
        context.spinner?.stop();
        const cloudConfig = CloudUtils.getConfiguration(cfg);
        const profileProvider = new DefaultProfileProvider();
        const profile = await profileProvider.provide(cloudConfig);
        const faasConfig = config.malagu.cloud.faas;
        if (!faasConfig.account?.id) {
            faasConfig.account = profile.account;
        }
        if (!faasConfig.region) {
            faasConfig.region = profile.region;
        }
    }
};
