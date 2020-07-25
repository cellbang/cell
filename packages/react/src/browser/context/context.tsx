import * as React from 'react';
import { Context } from '../annotation';

export interface ContextProps {}

export interface ContextState {}

@Context()
export class NoOpContext extends React.Component<ContextProps, ContextState> {

    static priority = 1000;

    render(): React.ReactElement<{}> {
        return <React.Fragment>{this.props.children}</React.Fragment>;
    }
}
