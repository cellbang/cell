import { ConfigProvider, AntdConfig } from './config-protocol';
import { Component, Value, Autowired, Optional } from '@malagu/core';

@Component(ConfigProvider)
export class ConfigProviderImpl implements ConfigProvider {

    @Value('malagu.antd.config')
    protected readonly antdConfig: AntdConfig;

    @Autowired(AntdConfig) @Optional()
    protected readonly antdConfig2: AntdConfig;

    provide(): AntdConfig {
        return { ...this.antdConfig2, ...this.antdConfig };
    }

}
