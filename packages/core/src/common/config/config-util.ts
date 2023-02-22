import { ConfigProvider } from './config-protocol';
import { ContainerUtil } from '../container';
import { config } from './dynamic-config';
import { currentThis } from '../utils';

export namespace ConfigUtil {
    export function get<T = any>(key: string, defaultValue?: T): T {
        return ContainerUtil.get<ConfigProvider>(ConfigProvider).get(key, defaultValue);
    }

    export function getRaw() {
        return currentThis.malaguProps || config;
    }
}
