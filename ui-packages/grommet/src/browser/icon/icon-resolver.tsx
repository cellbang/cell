import * as React from 'react';
import { Component, Autowired, PostConstruct } from '@malagu/core';
import * as icons from 'grommet-icons';
import { IconProps } from './icon-protocol';
import { ICON, IconResolver } from '@malagu/react';

@Component(IconResolver)
export class IconResolverImpl implements IconResolver<IconProps> {

    @Autowired(ICON)
    protected readonly extendedIcons: React.ComponentType<any>[];

    @PostConstruct()
    protected init() {
        for (const icon of this.extendedIcons) {
            (icons as any)[icon.name] = icon;
        }
    }

    async resolve({ icon, ...rest }: IconProps): Promise<React.ReactNode> {
        if (!icon) {
            return <></>;
        }
        const [ iconKey, color, size ] = icon.split(/\s+/);
        const Icon = (icons as any)[iconKey];
        rest.color =  color || rest.color;
        rest.size = size || rest.size;
        return (<Icon {...rest}></Icon>);
    }

}
