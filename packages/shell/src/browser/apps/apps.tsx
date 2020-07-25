import * as React from 'react';
import { Grid, Box, Text, ResponsiveContext } from 'grommet';
import { ContainerUtil } from '@malagu/core';
import { AppService, Category, AppInfo } from '../../common';
import { Icon } from '@malagu/grommet';
import { useIntl } from 'react-intl';
const { useState, useEffect, useContext } = React;

export function Apps({ size }: { size?: string }) {
    size = size || useContext(ResponsiveContext);
    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        const loadApps = async () => {
            const appService = ContainerUtil.get<AppService>(AppService);
            const data = await appService.load();
            setCategories(data);
        };
        loadApps();
    }, []);

    return (
        <Box direction="column" pad="small" gap="small" alignContent="start"
        >
            {categories.map(c => (
                <AppCategory key={c.id} size={size!} category={c}></AppCategory>
            ))}
        </Box>
    );
}

export function AppCategory({ category, size }: { category: Category, size: string }) {
    const intl = useIntl();
    const apps = category.apps || [];
    return (
        <Box>
            <Text weight="bold" textAlign={ size === 'small' ? 'center' : 'start' } size={size} margin={{ bottom: size }}>{ intl.formatMessage({ id: category.name}) }</Text>
            <Box border={{ side: 'top', color: 'light-2' }}></Box>
            <Grid
                rows={size === 'small' ? 'xsmall' : 'small'}
                columns={size === 'small' ? 'xsmall' : 'small'}
            >
                {apps.map(app => (
                    <AppItem key={app.id} size={size} app={app}></AppItem>
                ))}

            </Grid>
        </Box>
    );
}

export function AppItem({ app, size }: { app: AppInfo, size: string }) {
    const intl = useIntl();
    const onClick = () => {
        window.location.href = app.url;
    };
    return (
        <Box
            justify="center"
            align="center"
            hoverIndicator
            onClick={onClick}
        >
            <Icon icon={app.icon} size={size === 'small' ? 'medium' : 'large'}/>
            <Text size={size} margin={{ top: size }}>{intl.formatMessage({ id: app.name})}</Text>
        </Box>
    );
}
