import { ThemeProvider, ThemeOptions } from './theme-protocol';
import { Component, Value, Autowired, Optional } from '@malagu/core';
import { createMuiTheme, Theme } from '@material-ui/core';

@Component(ThemeProvider)
export class ThemeProviderImpl implements ThemeProvider {

    @Value('malagu["material-ui"].themeOptions')
    protected readonly themeOptions: ThemeOptions;

    @Autowired(ThemeOptions) @Optional()
    protected readonly themeOptions2: ThemeOptions;

    provide(): Theme {
        return createMuiTheme({ ...this.themeOptions2, ...this.themeOptions });
    }

}
