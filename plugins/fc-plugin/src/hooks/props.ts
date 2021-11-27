import { PropsContext } from '@malagu/cli-common';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';

export default async (context: PropsContext) => {
    const { props, cfg } = context;
    if (props.mode && props.mode.includes('remote')) {
        context.spinner?.stop();
        const cloudConfig = CloudUtils.getConfiguration(cfg);
        const profileProvider = new DefaultProfileProvider();
        const profile = await profileProvider.provide(cloudConfig);
        const faasConfig = props.malagu.cloud.faas;
        if (!faasConfig.account?.id) {
            faasConfig.account = profile.account;
        }
        if (!faasConfig.region) {
            faasConfig.region = profile.region;
        }
    }
};
