import * as React from 'react';
import { Context, ReactComponent } from '@malagu/react/lib/browser';
import { ThemeProvider as Provider, THEME_REACT_CONTEXT_PRIORITY } from './theme-protocol';
import { ThemeProvider } from '@material-ui/core';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';

@ReactComponent(Context)
export class ThemeContext extends React.Component implements Context {

    static priority = THEME_REACT_CONTEXT_PRIORITY;

    @Autowired(Provider)
    protected readonly provider: Provider;

    render(): React.ReactElement {
        const { children } = this.props;
        return (
            <ThemeProvider theme={this.provider.provide()}>
                {children}
            </ThemeProvider>);
    }
}
