import * as React from 'react';
import clsx from 'clsx';
import * as PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Drawer } from '@material-ui/core';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ImageIcon from '@material-ui/icons/Image';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import CollectionsBookmarkOutlined from '@material-ui/icons/CollectionsBookmarkOutlined';

import { SidebarNav } from './components';

const useStyles = makeStyles((theme: any) => ({
    drawer: {
        width: 240,
        [theme.breakpoints.up('lg')]: {
            marginTop: 64,
            height: 'calc(100% - 64px)'
        }
    },
    root: {
        backgroundColor: theme.palette.white,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing(2)
    },
    divider: {
        margin: theme.spacing(2, 0)
    },
    nav: {
        marginBottom: theme.spacing(2)
    }
}));

export const Sidebar = (props: any) => {
    const { open, variant, onClose, className, ...rest } = props;

    const classes = useStyles();

    const pages = [
        {
            title: '首页',
            href: '/home',
            icon: <DashboardIcon />
        },
        {
            title: '模板',
            href: '/templates',
            icon: <CollectionsBookmarkOutlined />
        },
        {
            title: '组件',
            href: '/components',
            icon: <ImageIcon />
        },
        {
            title: '文档',
            href: '/documents',
            icon: <AccountBoxIcon />
        }
    ];

    return (
        <Drawer
            anchor='left'
            classes={{ paper: classes.drawer }}
            onClose={onClose}
            open={open}
            variant={variant}
        >
            <div
                {...rest}
                className={clsx(classes.root, className)}
            >
                <SidebarNav
                    className={classes.nav}
                    pages={pages}
                />
            </div>
        </Drawer>
    );
};

Sidebar.propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func,
    open: PropTypes.bool.isRequired,
    variant: PropTypes.string.isRequired
};
