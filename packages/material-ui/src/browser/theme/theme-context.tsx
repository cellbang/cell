import * as React from 'react';
import { Context } from '@malagu/react';
import { ThemeProvider as Provider, THEME_REACT_CONTEXT_PRIORITY } from './theme-protocol';
import { ThemeProvider } from '@material-ui/core';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';

@Context()
export class ThemeContext extends React.Component {

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
