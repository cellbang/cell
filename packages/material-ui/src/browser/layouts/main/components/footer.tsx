import * as React from 'react';
import * as PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: any) => ({
    root: {
        padding: theme.spacing(4)
    }
}));

export const Footer = (props: any) => {
    const { className, ...rest } = props;

    const classes = useStyles(props);

    return (
        <div
            {...rest}
            className={clsx(classes.root, className)}
        >
        </div>
    );
};

Footer.propTypes = {
    className: PropTypes.string
};
