import * as React from 'react';
import { ReactComponent } from '../annotation';
import { Router, HistoryProvider, RouteMetadataProvider, RedirectMetadata } from './app-protocol';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';
import { Router as ReactRouter, Switch, Redirect, Route } from 'react-router-dom';

export interface RouterProps { }

export interface RouterState {
    child: React.ReactElement[];
}

@ReactComponent(Router)
export class RouterImpl extends React.Component<RouterProps, RouterState> implements Router {

    @Autowired(RouteMetadataProvider)
    protected readonly routeMetadataProvider: RouteMetadataProvider;

    @Autowired(HistoryProvider)
    protected readonly historyProvider: HistoryProvider;

    render(): React.ReactElement<{}> {
        return (
            <ReactRouter history={this.historyProvider.provide()}>
                <Switch>
                    { this.state && this.state.child || '' }
                </Switch>
            </ReactRouter>
        );
    }

    async componentDidMount() {
        const routeMetedatas = await this.routeMetadataProvider.provide();
        this.setState({ child: routeMetedatas.map((metadata, index) => {
            if (RedirectMetadata.is(metadata)) {
                return <Redirect key={index} {...metadata}/>;
            } else {
                return <Route key={index} {...metadata}/>;
            }
        })});
    }
}
