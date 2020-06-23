import { ConfigProvider } from './config-protocol';
import { ContainerUtil } from '../container';

export namespace ConfigUtil {
    export function get<T>(key: string, defaultValue?: T): T {
        return ContainerUtil.get<ConfigProvider>(ConfigProvider).get(key, defaultValue);
    }
}
