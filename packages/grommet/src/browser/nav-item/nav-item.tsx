import * as React from 'react';
import { Box, BoxProps, Text, ThemeContext } from 'grommet';
import { NavLink, useHistory } from 'react-router-dom';
import { ColorType, BackgroundType } from 'grommet/utils';
import { useIntl } from 'react-intl';

export interface NavItemProps extends BoxProps {
    origin?: string;
    path: string;
    icon?: JSX.Element;
    label?: string;
    size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | string;
    color?:  ColorType;
    activatable?: boolean;
    hoverIndicator?: BackgroundType | boolean;
    [key: string]: any;

}

export function InnerNavItem(props: NavItemProps) {
    const history = useHistory();
    const intl = useIntl();
    const { origin, path, icon, label, size, color, hoverIndicator = true, activatable = true, className, ...rest } = props;
    return (
        <ThemeContext.Extend value={{ box: { extend: { outline: 'none' } } }}>
            <Box direction="row" alignContent="start"
                responsive={false}
                gap={icon || label ? 'small' : 'none'} pad="small" hoverIndicator={hoverIndicator} focusIndicator={false}
                background={ className && activatable ? 'rgba(221,221,221,0.4)' : undefined }
                onClick={() => {
                    if (origin && window.location.origin !== origin) {
                        window.open(`${origin}${path}`);
                    } else {
                        history.push(path);
                    }
            }} {...rest}>
                {icon} { label && <Text color={color} style={size ? undefined : { fontSize: '14px' }} size={size}>{ intl.formatMessage({ id: label})}</Text>}
            </Box>
        </ThemeContext.Extend>
    );
}

export function NavItem(props: NavItemProps) {
    const { origin, path } = props;
    if (!origin || window.location.origin === origin) {
        return <NavLink to={path} component={p => (<InnerNavItem {...props} {...p}/>)}/>;
    } else {
        return <InnerNavItem {...props}/>;
    }

}
