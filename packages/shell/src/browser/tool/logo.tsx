import * as React from 'react';
import { ConfigUtil } from '@malagu/core';
import { Widget } from '@malagu/widget';
import { AreaType } from '../area';
import { NavItemProps, NavItem } from '@malagu/grommet';
import { Icon } from '@malagu/grommet';

export function Logo(props: NavItemProps) {
    const { label, icon, ...rest } = ConfigUtil.get('malagu.shell.logo');
    props = { ...rest, ...props };
    return (<NavItem size="medium" gap="xsmall" label={label} icon={<Icon icon={icon}/>} hoverIndicator={false} activatable={false} {...props}/>);
}

@Widget({ area: AreaType.TopLeftArea, component: Logo, priority: 1000 })
export default class {}
