import * as React from 'react';
import { ReactComponent } from '../annotation';
import { Context } from './app-protocol';

export interface ContextProps {}

export interface ContextState {}

@ReactComponent(Context)
export class NoOpContext extends React.Component<ContextProps, ContextState> implements Context {

    static priority = 1000;

    render(): React.ReactElement<{}> {
        return <React.Fragment>{this.props.children}</React.Fragment>;
    }
}
