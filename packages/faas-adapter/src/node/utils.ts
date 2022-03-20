import { ConfigUtil } from '@malagu/core/lib/common/config/config-util';

export namespace FaaSUtils {
    export function getCallbackWaitsForEmptyEventLoop() {
        return ConfigUtil.get<boolean>('malagu.cloud.function.callbackWaitsForEmptyEventLoop', false);
    }
}
