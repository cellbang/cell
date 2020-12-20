import { ConfigProvider } from './config-protocol';
import { ContainerUtil } from '../container';
import * as traverse from 'traverse';

const config: { [key: string]: any } = process.env.MALAGU_CONFIG as any || {};

const traverseConfig = traverse(config);

export namespace ConfigUtil {
    export function get<T>(key: string, defaultValue?: T): T {
        return ContainerUtil.get<ConfigProvider>(ConfigProvider).get(key, defaultValue);
    }

    export function getRaw() {
        return config;
    }

    export function getRawTraverse() {
        return traverseConfig;
    }
}
