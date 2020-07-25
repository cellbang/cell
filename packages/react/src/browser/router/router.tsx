import * as React from 'react';
import { RouteMetadataProvider, RedirectMetadata, RouteMetadata } from './router-protocol';
import { Autowired, Value } from '@malagu/core/lib/common/annotation/detached';
import { Router as ReactRouter, Redirect, Route, Switch, RedirectProps } from 'react-router-dom';
import { Router } from '../annotation';
import { HistoryProvider } from '../history';

export interface RouterProps { }

export interface RouterState {
    child: React.ReactElement[];
}

@Router(RouterImpl, false)
export class RouterImpl extends React.Component<RouterProps, RouterState> {

    @Autowired(RouteMetadataProvider)
    protected readonly routeMetadataProvider: RouteMetadataProvider;

    @Autowired(HistoryProvider)
    protected readonly historyProvider: HistoryProvider;

    @Value('malagu.react.path')
    protected readonly path: string | string[];

    render(): React.ReactElement<{}> {
        return (
            <ReactRouter history={this.historyProvider.provide()}>
                <Switch>
                    { this.buildRoutes(this.routeMetadataProvider.provide()) }
                </Switch>
            </ReactRouter>
        );
    }

    protected buildRoutes(list: (RouteMetadata | RedirectMetadata)[]) {
        return list.map((metadata, index) => {
            const props = { ...metadata };
            delete props.isDefaultLayout;
            delete props.priority;
            if (RedirectMetadata.is(metadata)) {
                return <Redirect key={index} {...(props as RedirectProps)}/>;
            } else {
                return <Route key={index} {...props}/>;
            }
        });
    }
}
