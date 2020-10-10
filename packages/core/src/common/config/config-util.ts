import { ConfigProvider } from './config-protocol';
import { ContainerUtil } from '../container';

const config: { [key: string]: any } = process.env.MALAGU_CONFIG as any;

export namespace ConfigUtil {
    export function get<T>(key: string, defaultValue?: T): T {
        return ContainerUtil.get<ConfigProvider>(ConfigProvider).get(key, defaultValue);
    }

    export function getAll() {
        return config;
    }
}
