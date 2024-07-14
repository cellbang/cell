import * as React from 'react';
import { Nav, Sidebar, BoxProps } from 'grommet';
import { ConfigUtil } from '@malagu/core';
import { AreaType } from '../area-protocol';
import { Slot } from '@malagu/react';
import { Widget } from '@malagu/widget';

export function LeftArea(props: BoxProps) {
    props = { ...(ConfigUtil.get('malagu.shell.leftArea') || {}), ...props };

    return (
        <Sidebar animation="fadeIn" pad="medium" background="white" width="250px"
            footer={<Slot area={AreaType.LeftFooterArea} />}
            {...props}
        >
            <Slot area={AreaType.LeftHeaderArea} />
            <Nav gap="none">
                <Slot area={AreaType.NavArea} />
                <Slot area={AreaType.LeftBodyArea} />
            </Nav>
        </Sidebar>
    );
}

@Widget({ area: AreaType.LeftArea, component: LeftArea })
export default class {}
