import { Theme } from '@material-ui/core';
import { ThemeOptions as TO } from '@material-ui/core/styles/createMuiTheme';

export const ThemeOptions = Symbol('ThemeOptions');
export const ThemeProvider = Symbol('ThemeProvider');

export const THEME_REACT_CONTEXT_PRIORITY = 2000;

export interface ThemeOptions extends TO {
}

export interface ThemeProvider {

    provide(): Theme;

}
