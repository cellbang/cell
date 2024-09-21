import * as React from 'react';
import { ConfigUtil } from '@celljs/core';
import { Widget } from '@celljs/widget';
import { AreaType } from '../area';
import { NavItemProps, NavItem, Icon } from '@celljs/grommet';

export function Logo(props: NavItemProps) {
    const { label, icon, ...rest } = ConfigUtil.get('cell.shell.logo');
    props = { ...rest, ...props };
    return (<NavItem size="medium" gap="xsmall" label={label} icon={<Icon icon={icon}/>} hoverIndicator={false} activatable={false} {...props}/>);
}

@Widget({ area: AreaType.TopLeftArea, component: Logo, priority: 1000 })
export default class {}
