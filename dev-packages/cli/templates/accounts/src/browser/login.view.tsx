import * as React from 'react';
import { useLocation } from 'react-router';
import { parse, stringify } from 'querystring';
import { ConfigUtil } from '@celljs/core';
import { View } from '@celljs/react';
import { LocaleMenu, Icon } from '@celljs/grommet';
import { useIntl } from 'react-intl';
import { Box, Button, Heading, ResponsiveContext, Nav } from 'grommet';
import styled from 'styled-components';
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

export function Login() {
    const location = useLocation();
    const size = useContext(ResponsiveContext);
    const intl = useIntl();
    const targetUrlParameter = ConfigUtil.get<string>('cell.security.targetUrlParameter');
    const registrations = ConfigUtil.get<{[key: string]: { icon?: string, clientName: string } }>('cell.oauth2.client.registrations');
    const redirect = parse(location.search && location.search.substring(1))[targetUrlParameter];
    const queryStr = redirect ? `?${stringify({ [targetUrlParameter]: redirect})}` : '';
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
            <Box direction="column" align="center" animation="slideDown">
                <Heading level="6">{intl.formatMessage({ id: 'accounts.quick.login.label' })}</Heading>
                <Nav>
                    {
                        Object.keys(registrations).map(id => (
                            <Button
                                hoverIndicator
                                icon={<Icon icon={registrations[id].icon || registrations[id].clientName} size="large"></Icon>}
                                href={`/oauth2/authorization/${id}${queryStr}`}>
                            </Button>
                        ))
                    }
                </Nav>
            </Box>
            <Box direction="column" fill="horizontal" style={ { position: 'absolute', bottom: 0 } } align="center">
                <LocaleMenu size="small" fontSize="12px"/>
            </Box>
        </StyledContainer>
    </StyledWraper>);

}

@View({ path: '/login', component: Login })
export default class {}
