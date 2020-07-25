import * as React from 'react';
import { IconProps } from './icon-protocol';
import { Icon as RawIcon } from '@malagu/react';
import { Blank, IconProps as RawIconProps } from 'grommet-icons';

export function Icon(iconProps: IconProps) {
    return (<RawIcon {...iconProps}/>);
}

export function Cellbang(props: RawIconProps) {
    return (
        <Blank {...props}>
            <svg viewBox="0 0 24 14.832" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="14.832" />
            </svg>
        </Blank>
    );
}
