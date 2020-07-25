import * as React from 'react';
import { Component } from '@malagu/core';
import * as icons from 'grommet-icons';
import { IconProps } from './icon-protocol';
import { IconResolver } from '@malagu/react';
import { Cellbang } from './icon';

(icons as any).Cellbang = Cellbang;

@Component(IconResolver)
export class IconResolverImpl implements IconResolver<IconProps> {

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
