import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import * as PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { AppBar, Toolbar } from '@material-ui/core';

const useStyles = makeStyles(() => ({
    root: {
        boxShadow: 'none'
    }
}));

export const Topbar = (props: any) => {
    const { className, ...rest } = props;

    const classes = useStyles();

    return (
        <AppBar
            {...rest}
            className={clsx(classes.root, className)}
            color='primary'
            position='fixed'
        >
            <Toolbar>
                <RouterLink to='/'>
                    <img
                    />
                </RouterLink>
            </Toolbar>
        </AppBar>
    );
};

Topbar.propTypes = {
    className: PropTypes.string
};
