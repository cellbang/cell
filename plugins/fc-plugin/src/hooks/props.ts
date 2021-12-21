import { PropsContext } from '@malagu/cli-common';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';

export default async (context: PropsContext) => {
    const { props, cfg } = context;
    if (props.mode && props.mode.includes('remote')) {
        context.spinner?.stop();
        const cloudConfig = CloudUtils.getConfiguration(cfg);
        const profileProvider = new DefaultProfileProvider();
        const profile = await profileProvider.provide(cloudConfig);
        if (!cloudConfig.account?.id) {
            cloudConfig.account = profile.account;
        }
        if (!cloudConfig.region) {
            cloudConfig.region = profile.region;
        }
    }
};
