import * as React from 'react';
import { DefaultLayout, View } from '../annotation';

@DefaultLayout(EmptyLayout, false)
@View({ priority: 100, isDefaultLayout: false })
export class EmptyLayout extends React.Component<{}, {}> {

    render() {
        return <React.Fragment>{this.props.children}</React.Fragment>;
    }
}
