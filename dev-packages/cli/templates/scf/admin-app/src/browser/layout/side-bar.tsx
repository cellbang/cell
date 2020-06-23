import * as React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';
import MouseIcon from '@material-ui/icons/Mouse';
import PolicyIcon from '@material-ui/icons/Policy';
import { ContainerUtil } from '@malagu/core';
import { PathResolver } from '@malagu/react'


const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
        },
        drawerContainer: {
            overflow: 'auto',
        }
    }),
);

export function SideBar() {
    const classes = useStyles();
    const pathResolver = ContainerUtil.get<PathResolver>(PathResolver);

    return (
        <React.Fragment>
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <Toolbar />
                <div className={classes.drawerContainer}>
                    <List>
                        <ListItem component={Link} to={pathResolver.resolve('/page1')}>
                            <ListItemIcon>
                                <MouseIcon />
                            </ListItemIcon>
                            <ListItemText primary="Page1"/>
                        </ListItem>
                        <ListItem component={Link} to={pathResolver.resolve('/page2')}>
                            <ListItemIcon>
                                <PolicyIcon />
                            </ListItemIcon>
                            <ListItemText primary="Page2"/>
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </React.Fragment>
    );
}
