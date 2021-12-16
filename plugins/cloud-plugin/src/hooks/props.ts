import { PropsContext, ConfigUtil } from '@malagu/cli-common';
import { CloudUtils } from './utils';

export default async (context: PropsContext) => {
    const { props, pkg, cfg } = context;
    props.malagu = props.malagu || {};
    props.malagu.cloud = ConfigUtil.merge(props.malagu.cloud, props.cloud);
    props.cloud = props.malagu.cloud;
    let stage = pkg.rootComponentPackage?.malaguComponent?.stage;
    if (!stage) {
        const config = CloudUtils.getConfiguration(cfg);
        const profile = await CloudUtils.getProfileFromFile(config.profilePath);
        stage = profile?.stage;
        if (stage) {
            props.stage = stage;
        }
    }
};
