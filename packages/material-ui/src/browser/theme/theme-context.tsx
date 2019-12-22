import * as React from 'react';
import { Context, ReactComponent } from '@malagu/react/lib/browser';
import { Constant } from '@malagu/core';
import { theme } from '.';
import { ThemeProvider } from '@material-ui/core';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';

export const Theme = Symbol('Theme');

@Constant(Theme, theme)
@ReactComponent(Context)
export class ThemeContext extends React.Component implements Context {

    static priority = 900;

    @Autowired(Theme)
    protected readonly theme: any;

    render(): React.ReactElement<{}> {
        const { children } = this.props;
        return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>);
    }
}
