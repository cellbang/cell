import * as React from 'react';
import { Context, ReactComponent } from '@malagu/react/lib/browser';
import { ConfigProvider as Provider, CONFIG_REACT_CONTEXT_PRIORITY } from './config-protocol';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';
import { ConfigProvider } from 'antd';

@ReactComponent(Context)
export class ConfigContext extends React.Component implements Context {

    static priority = CONFIG_REACT_CONTEXT_PRIORITY;

    @Autowired(Provider)
    protected readonly provider: Provider;

    render(): React.ReactElement {
        const { children } = this.props;
        return (
            <ConfigProvider {...this.provider.provide()}>
                {children}
            </ConfigProvider>);
    }
}
