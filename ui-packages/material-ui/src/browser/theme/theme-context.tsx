import * as React from 'react';
import { Context } from '@celljs/react';
import { ThemeProvider as Provider, THEME_REACT_CONTEXT_PRIORITY } from './theme-protocol';
import { ThemeProvider } from '@material-ui/core';
import { Autowired } from '@celljs/core/lib/common/annotation/detached';

@Context()
export class ThemeContext extends React.Component<React.PropsWithChildren> {

    static priority = THEME_REACT_CONTEXT_PRIORITY;

    @Autowired(Provider)
    protected readonly provider: Provider;

    override render(): React.ReactNode {
        const { children } = this.props;
        return (
            <ThemeProvider theme={this.provider.provide()}>
                {children}
            </ThemeProvider>);
    }
}
