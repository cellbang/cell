import * as React from 'react';
import { DefaultLayout, View } from '../annotation';

@DefaultLayout(EmptyLayout, false)
@View({ priority: 100, isDefaultLayout: false })
export class EmptyLayout extends React.Component<React.PropsWithChildren, {}> {

    render() {
        return <>{this.props.children}</>;
    }
}
