import { Component, Autowired, Deferred } from '../../common';
import { Route } from './handler-protocol';
import { RouteBuilder } from './route-builder';
import { postConstruct } from 'inversify';

@Component()
export class RouteProvider {

    protected route: Route;

    protected routeDefered = new Deferred<Route>();

    @Autowired(RouteBuilder)
    protected readonly routeBuilder: RouteBuilder;

    @postConstruct()
    protected async init() {
        this.route = await this.routeBuilder.build();
        this.routeDefered.resolve(this.route);
    }

    async provide(): Promise<Route> {
        return await this.routeDefered.promise;
    }

}
