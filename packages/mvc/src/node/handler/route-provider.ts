import { Component, Autowired, Deferred } from '@malagu/core';
import { Route, RouteProvider } from './handler-protocol';
import { RouteBuilder } from './route-builder';
import { postConstruct } from 'inversify';

@Component(RouteProvider)
export class RouteProviderImpl implements RouteProvider {

    protected route: Route;

    protected routeDefered = new Deferred<Route>();

    @Autowired(RouteBuilder)
    protected readonly routeBuilder: RouteBuilder;

    @postConstruct()
    protected async init() {
        this.route = await this.routeBuilder.build();
        this.routeDefered.resolve(this.route);
    }

    provide(): Promise<Route> {
        return this.routeDefered.promise;
    }

}
