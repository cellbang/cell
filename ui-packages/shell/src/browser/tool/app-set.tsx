import * as React from 'react';
import { Button, ButtonProps, Drop } from 'grommet';
import { ConfigUtil } from '@celljs/core';
import { Icon } from '@celljs/grommet';
import { Widget } from '@celljs/widget';
import { AreaType } from '../area';
import { Apps } from '../apps';
import styled from 'styled-components';

const { Fragment } = React;

const StyledAppSet = styled.div`
    width: 320px;
    max-height: 450px;
    padding-top: 12px;
    overflow: auto;
`;

export function AppSet(props: ButtonProps) {
    // eslint-disable-next-line no-null/no-null
    const targetRef = React.useRef(null);
    const [show, setShow] = React.useState(false);
    const { icon, ...rest } = ConfigUtil.get('cell.shell.appSet');
    props = { ...rest, ...props };
    return (
        <Fragment>
            <Button ref={targetRef} hoverIndicator onClick={() => setShow(true)} {...props} icon={<Icon icon={icon}/>}/>
            {targetRef.current && show && (
                <Drop
                    target={targetRef.current!}
                    style={{ marginTop: '20px' }}
                    elevation="large"
                    align={{ top: 'bottom', right: 'right'}}
                    onEsc={() => setShow(false)}
                    onClickOutside={() => setShow(false)}
                >
                    <StyledAppSet>
                        <Apps size="small"/>
                    </StyledAppSet>
                </Drop>
            )}
        </Fragment>
    );
}

@Widget({ area: AreaType.TopRightArea, component: AppSet, priority: 200 })
export default class {}
