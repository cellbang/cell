import * as React from 'react';
import { Box, Nav, BoxProps } from 'grommet';
import { ConfigUtil } from '@malagu/core';
import { AreaType } from '../area-protocol';
import { Slot } from '@malagu/react';
import { Widget } from '@malagu/widget';

export function TopArea(props: BoxProps) {
    props = { ...ConfigUtil.get('malagu.shell.topArea'), ...props };

    return (
        <Nav direction="row" pad={{ vertical: 'small', horizontal: 'medium' }} elevation="xsmall" justify="between" {...props}>
            <Box direction="row" gap="small">
                <Slot area={AreaType.TopLeftArea} />
            </Box>
            <Box direction="row" gap="small">
                <Slot area={AreaType.TopRightArea} />
            </Box>
        </Nav>
    );
}

@Widget({ area: AreaType.TopArea, component: TopArea })
export default class {}
