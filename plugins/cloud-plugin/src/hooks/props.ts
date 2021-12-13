import { PropsContext, ConfigUtil } from '@malagu/cli-common';

export default async (context: PropsContext) => {
    const { props } = context;
    props.malagu = props.malagu || {};
    props.malagu.cloud = ConfigUtil.merge(props.malagu.cloud, props.cloud);
    props.cloud = props.malagu.cloud;
};
