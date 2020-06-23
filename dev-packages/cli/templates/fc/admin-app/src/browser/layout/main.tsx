import * as React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import { TopBar } from './top-bar';
import { SideBar } from './side-bar';
import { DefaultLayout } from '@malagu/react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  }),
);

export function Main(props: { children?: JSX.Element }) {
    const { children } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar></TopBar>
      <SideBar></SideBar>
      <main className={classes.content}>
        <Toolbar />
        {children}
      </main>
    </div>
  );
}

@DefaultLayout(Main)
export default class {

}
