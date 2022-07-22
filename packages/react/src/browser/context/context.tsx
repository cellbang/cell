import * as React from 'react';
import { Context } from '../annotation';

export interface ContextProps extends React.PropsWithChildren {}

export interface ContextState {}

@Context()
export class NoOpContext extends React.Component<ContextProps, ContextState> {

    static priority = 1000;

    render(): React.ReactElement<{}> {
        return <>{this.props.children}</>;
    }
}
