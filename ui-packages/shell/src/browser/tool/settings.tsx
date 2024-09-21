import * as React from 'react';
import { Button, ButtonProps, Drop, ThemeType, Box } from 'grommet';
import { ConfigUtil, ContainerUtil } from '@celljs/core';
import { Icon, ThemeBox, LocaleMenu } from '@celljs/grommet';
import { Widget, ThemeManager } from '@celljs/widget';
import { AreaType } from '../area';
import styled from 'styled-components';
import { Slot } from '@celljs/react';

const { Fragment } = React;

const StyledSettings = styled.div`
    width: 300px;
    max-height: 450px;
    padding-top: 12px;
    overflow: auto;
    right: 0;
`;
// @ts-ignore
export function Settings(props: ButtonProps) {
    // eslint-disable-next-line no-null/no-null
    const targetRef = React.useRef(null);
    const [show, setShow] = React.useState(false);
    const { icon, ...rest } = ConfigUtil.get<any>('cell.shell.settings');
    props = { ...rest, ...props };
    React.useEffect(() => {
        const themeManager = ContainerUtil.get<ThemeManager<ThemeType>>(ThemeManager);
        const subscription = themeManager.currentSubject.subscribe(t => setShow(false));
        return () => subscription.unsubscribe();
    }, []);
    // @ts-ignore
    return (<Fragment>
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
                <StyledSettings>
                    <Box>
                        <Slot area={AreaType.SettingsArea}/>
                    </Box>
                </StyledSettings>
            </Drop>
        )}
    </Fragment>);
}

@Widget({ area: AreaType.SettingsArea, component: LocaleMenu, priority: 200 })
@Widget({ area: AreaType.SettingsArea, component: ThemeBox, priority: 300 })
@Widget({ area: AreaType.TopRightArea, component: Settings, priority: 300 })
export default class {}
