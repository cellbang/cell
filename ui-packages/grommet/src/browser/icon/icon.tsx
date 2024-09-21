import * as React from 'react';
import { IconProps } from './icon-protocol';
import { Icon as RawIcon } from '@celljs/react/lib/browser/icon/icon';

export function Icon(iconProps: IconProps) {
    return (<RawIcon {...iconProps}/>);
}
