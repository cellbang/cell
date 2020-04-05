export const AntdConfig = Symbol('AntdConfig');
export const ConfigProvider = Symbol('ConfigProvider');

export const CONFIG_REACT_CONTEXT_PRIORITY = 2000;

export interface AntdConfig {
    [key: string]: any
}

export interface ConfigProvider {

    provide(): AntdConfig;

}
