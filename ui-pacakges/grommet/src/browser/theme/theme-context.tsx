import * as React from 'react';
import { Context } from '@malagu/react';
import { THEME_REACT_CONTEXT_PRIORITY } from './theme-protocol';
import { Grommet, grommet, ThemeType } from 'grommet';
import { ThemeManager } from '@malagu/widget';
import { ContainerUtil } from '@malagu/core';

export function ThemeContext({ children }: React.PropsWithChildren<any>) {
    const themeManager = ContainerUtil.get<ThemeManager<ThemeType>>(ThemeManager);
    const [theme, setTheme] = React.useState(themeManager.currentSubject.value?.props);
    React.useEffect(() => {
        const subscription = themeManager.currentSubject.subscribe(t => setTheme(t?.props));
        return () => subscription.unsubscribe();
    }, []);

    return (
        <Grommet theme={theme || grommet}>
            {children}
        </Grommet>);
}

ThemeContext.priority = THEME_REACT_CONTEXT_PRIORITY;

@Context(ThemeContext)
export default class {}
