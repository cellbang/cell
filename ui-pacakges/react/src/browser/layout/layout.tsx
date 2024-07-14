import * as React from 'react';
import { DefaultLayout } from '../annotation';

@DefaultLayout(EmptyLayout, false)
export class EmptyLayout extends React.Component<React.PropsWithChildren> {

    override render() {
        return <>{this.props.children}</>;
    }
}
