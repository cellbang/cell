import * as React from 'react';
import { Box, BoxProps, ThemeType } from 'grommet';
import { Theme } from '@malagu/widget';
import { ContainerUtil } from '@malagu/core';
import { ThemeManager } from '@malagu/widget';
import { Checkmark, Paint } from 'grommet-icons';

export function ThemeBox(props: BoxProps) {
    const themeManager = ContainerUtil.get<ThemeManager<ThemeType>>(ThemeManager);
    const [themes, setThemes] = React.useState<Theme<ThemeType>[]>([]);
    const [current, setCurrent] = React.useState<Theme<ThemeType> | undefined>(themeManager.currentSubject.value);
    React.useEffect(() => {
        themeManager.get().then(ts => setThemes(ts));
        const subscription = themeManager.currentSubject.subscribe(t => setCurrent(t));
        return () => subscription.unsubscribe();
    }, []);
    return (
        <Box fill direction="row" pad="small" gap="small" {...props}>
            <Paint color={current?.color}/>
            {themes.map(theme => (
                <Box key={theme.id} elevation="small"
                    width="24px" height="24px"
                    onClick={() => themeManager.currentSubject.next(theme === themeManager.currentSubject.value ? undefined : theme)}
                    background={theme.color || theme.props.global?.colors?.brand}>
                    {current && current.id === theme.id && (<Checkmark color="#FFFFFF"/>) }
                </Box>
            ))}
        </Box>
    );
}
