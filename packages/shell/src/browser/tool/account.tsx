import * as React from 'react';
import { Avatar, AvatarProps, Drop, Box } from 'grommet';
import { ConfigUtil, ContainerUtil } from '@malagu/core';
import { Widget } from '@malagu/widget';
import { AreaType } from '../area';
import styled from 'styled-components';
import { Slot } from '@malagu/react';
import { LoginUserManager, User } from '../user';
import { NavItem, Icon } from '@malagu/grommet';

const StyledAccount = styled.div`
    width: 200px;
    max-height: 450px;
    padding-top: 12px;
    overflow: auto;
    right: 0;
`;

export function Account(props: AvatarProps) {
    // eslint-disable-next-line no-null/no-null
    const targetRef = React.useRef(null);
    const loginUserManager = ContainerUtil.get<LoginUserManager>(LoginUserManager);
    const [show, setShow] = React.useState(false);
    const [user, setUser] = React.useState<User | undefined>(loginUserManager.userSubject.value);
    React.useEffect(() => {
        const subscription = loginUserManager.userSubject.subscribe(u => setUser(u));
        return () => subscription.unsubscribe();
    }, []);
    const { icon, login, ...rest } = ConfigUtil.get('malagu.shell.account');
    props = { ...rest, ...props };
    if (!user) {
        const { label, ...loginRest } = login;
        return (<NavItem label={label} size="medium" {...loginRest}/>);
    }
    return (
        <Box ref={targetRef}>
            <Avatar hoverIndicator title={user.name} style={{ marginLeft: '4px' }} onClick={() => setShow(true)} {...props}>{<Icon icon={user.avatar || icon}/>}</Avatar>
            {targetRef.current && show && (
                <Drop
                    target={targetRef.current!}
                    style={{ margin: '20px 0' }}
                    elevation="large"
                    align={{ top: 'bottom', right: 'right'}}
                    onEsc={() => setShow(false)}
                    onClickOutside={() => setShow(false)}
                >
                    <StyledAccount>
                        <Slot area={AreaType.AccountArea}/>
                    </StyledAccount>
                </Drop>
            )}
        </Box>
    );
}

@Widget({ area: AreaType.TopRightArea, component: Account, priority: 100 })
export default class {}
