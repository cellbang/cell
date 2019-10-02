export const ConfigProvider = Symbol('ConfigProvider');

export interface ConfigProvider {
    get<T>(key: string, defaultValue?: T): T;
}
