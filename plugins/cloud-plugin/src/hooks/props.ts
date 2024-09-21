import { PropsContext, ConfigUtil } from '@celljs/cli-common';
import { CloudUtils } from './utils';

export default async (context: PropsContext) => {
    const { props, pkg, cfg } = context;
    props.cell = props.cell || {};
    props.cell.cloud = ConfigUtil.merge(props.cell.cloud, props.cloud);
    props.cloud = props.cell.cloud;
    let stage = pkg.rootComponentPackage?.cellComponent?.stage;
    if (!stage) {
        const config = CloudUtils.getConfiguration(cfg);
        const profile = await CloudUtils.getProfileFromFile(config.profilePath);
        stage = profile?.stage;
        if (stage) {
            props.stage = stage;
        }
    }
};
