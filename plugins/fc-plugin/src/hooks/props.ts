import { PropsContext } from '@celljs/cli-common';
import { BACKEND_TARGET } from '@celljs/cli-common/lib/constants';
import { CloudUtils, DefaultProfileProvider } from '@celljs/cloud-plugin';

export async function before(context: PropsContext) {
    const { props, cfg, target } = context;
    if (target === BACKEND_TARGET && props.mode && props.mode.includes('remote')) {
        context.spinner?.stop();
        const cloudConfig = CloudUtils.getConfiguration(cfg);
        const profileProvider = new DefaultProfileProvider();
        const profile = await profileProvider.provide(cloudConfig, true);
        if (!cloudConfig.account?.id) {
            cloudConfig.account = profile?.account;
        }
        if (!cloudConfig.region) {
            cloudConfig.region = profile?.region;
        }
    }
}
