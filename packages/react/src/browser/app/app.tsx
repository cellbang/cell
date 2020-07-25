import * as React from 'react';
import { ROUTER } from '../router';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';
import { App } from '../annotation';
import { ContextProvider } from '../context';

export interface AppProps { }

export interface AppState {
    child: JSX.Element
}

@App(AppImpl, false)
export class AppImpl extends React.Component<AppProps, AppState> {

    @Autowired(ContextProvider)
    protected readonly contextProvider: ContextProvider;

    @Autowired(ROUTER)
    protected readonly router: React.ComponentType<any>;

    render(): React.ReactElement<{}> {
        return <React.Fragment>{ this.createContextAndRouter() }</React.Fragment>;
    }

    protected createContextAndRouter() {
        const R = this.router;
        let child = <R/>;
        this.contextProvider.provide().forEach((C, index) => child = <C key={index}>{child}</C> );
        return child;
    }
}
