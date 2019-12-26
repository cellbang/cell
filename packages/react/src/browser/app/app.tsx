import * as React from 'react';
import { ReactComponent } from '../annotation';
import { App, ContextProvider, Router } from './app-protocol';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';

export interface AppProps { }

export interface AppState {
    child: JSX.Element
}

@ReactComponent(App)
export class AppImpl extends React.Component<AppProps, AppState> implements App {

    @Autowired(ContextProvider)
    protected readonly contextProvider: ContextProvider;

    @Autowired(Router)
    protected readonly router: new() => Router;

    render(): React.ReactElement<{}> {
        return <React.Fragment>{ this.state && this.state.child }</React.Fragment>;
    }

    async componentDidMount() {
        const R = this.router;
        let child = <R/>;
        (await this.contextProvider.provide()).forEach((C, index) => child = <C key={index}>{child}</C> );
        this.setState({ child });
    }
}
