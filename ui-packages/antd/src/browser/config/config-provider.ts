import { ConfigProvider, AntdConfig } from './config-protocol';
import { Component, Value, Autowired, Optional } from '@celljs/core';

@Component(ConfigProvider)
export class ConfigProviderImpl implements ConfigProvider {

    @Value('cell.antd.config')
    protected readonly antdConfig: AntdConfig;

    @Autowired(AntdConfig) @Optional()
    protected readonly antdConfig2: AntdConfig;

    provide(): AntdConfig {
        return { ...this.antdConfig2, ...this.antdConfig };
    }

}
