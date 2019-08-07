export const ConfigProvider = Symbol('ConfigProvider');

export const CONFIG = '__config';

export interface ConfigProvider {
    get<T>(key: string, defaultValue?: T): T;
}
