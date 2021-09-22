import * as React from 'react';
import { ConfigUtil, ContainerUtil } from '@malagu/core';
import { UserManager } from '@malagu/security/lib/browser';
import { View, Redirect } from '@malagu/react';
import { LocaleMenu, Icon } from '@malagu/grommet';
import { useIntl } from 'react-intl';
import { Box, Button, Heading, ResponsiveContext, Avatar, Text} from 'grommet';
import { Logout } from 'grommet-icons';
import styled from 'styled-components';
import { User } from '@malagu/security';
const { useContext } = React;

const StyledWraper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fafafa;
`;

interface ContainerProps {
    size: string;
};

const StyledContainer = styled.div<ContainerProps>`
    width: ${props => props.size === 'small' ? '100%' : '340px'};
    height: ${props => props.size === 'small' ? '100%' : '500px'};
    position: absolute;
    top: ${props => props.size === 'small' ? '0' : 'calc(50% - 250px)'};
    left: ${props => props.size === 'small' ? '0' : 'calc(50% - 170px)'};
    text-align: center;
    background-color: #ffffff;
    box-shadow: ${props => props.size === 'small' ? 'none' : '0px 0px 5px #e9e9e9'};
    border-radius: ${props => props.size === 'small' ? '0' : '4px'};
`;

export function Home() {
    const size = useContext(ResponsiveContext);
    const intl = useIntl();
    
    const loginUserManager = ContainerUtil.get<UserManager>(UserManager);
    const [user, setUser] = React.useState<User | undefined>(loginUserManager.userInfoSubject.value);
    React.useEffect(() => {
        const subscription = loginUserManager.userInfoSubject.subscribe(u => setUser(u));
        return () => subscription.unsubscribe();
    }, []);
    
    return (
    <StyledWraper style={size === 'small' ? { top: 0, bottom: 0, right: 0, left: 0 } : undefined }>
        <StyledContainer size={size}>
            <Box direction="column" pad="large" align="center" background="brand" round={ size === 'small' ? undefined : { corner: 'top', size: '4px' } }>
                <Button plain
                    href={ConfigUtil.get('accounts.home.url')}
                    icon={<Icon size="large" color="white" icon={ConfigUtil.get('accounts.logo.icon')}></Icon>}>
                </Button>
                <Heading level="4" color="white">{intl.formatMessage({ id: 'accounts.logo.label' })}</Heading>
            </Box>
            <Box direction="column" align="center" animation="slideDown" pad="large">
                {user && (
                    <Box direction="column" align="center">
                        <Avatar
                            hoverIndicator title={user.nickname} src={user.avatar} margin="small">
                        </Avatar>
                        <Text>{user.nickname}</Text>
                        <Text style={{ opacity: .7, fontSize: '.8em' }} >{user.email}</Text>
                        <Button
                            title={intl.formatMessage({ id: 'accounts.logout.label' })}
                            margin='small'
                            hoverIndicator
                            icon={<Logout/>}
                            onClick={() => loginUserManager.logout()}>
                        </Button>
                    </Box>
                )}
            </Box>
            <Box direction="column" fill="horizontal" style={ { position: 'absolute', bottom: 0 } } align="center">
                <LocaleMenu size="small" fontSize="12px"/>
            </Box>
        </StyledContainer>
    </StyledWraper>);

}
@View({ path: '/home', component: Home,  })
@Redirect({ from: '/', to: '/home', exact: true })
export default class {}
