import * as React from 'react';
import { Context } from '@malagu/react';
import { ConfigProvider as Provider, CONFIG_REACT_CONTEXT_PRIORITY } from './config-protocol';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';
import { ConfigProvider } from 'antd';

@Context()
export class ConfigContext extends React.Component<React.PropsWithChildren> {

    static priority = CONFIG_REACT_CONTEXT_PRIORITY;

    @Autowired(Provider)
    protected readonly provider: Provider;

    override render(): React.ReactNode {
        const { children } = this.props;
        return (
            <ConfigProvider {...this.provider.provide()}>
                {children}
            </ConfigProvider>);
    }
}

