import { ConfigUtil } from '@celljs/core/lib/common/config/config-util';

export namespace FaaSUtils {
    export function getCallbackWaitsForEmptyEventLoop() {
        return ConfigUtil.get<boolean>('cell.cloud.function.callbackWaitsForEmptyEventLoop', false);
    }
}
