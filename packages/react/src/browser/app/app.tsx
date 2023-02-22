import * as React from 'react';
import { ROUTER } from '../router';
import { Autowired } from '@malagu/core/lib/common/annotation/detached';
import { App } from '../annotation';
import { ContextProvider } from '../context';

@App(AppImpl, false)
export class AppImpl extends React.Component {

    @Autowired(ContextProvider)
    protected readonly contextProvider: ContextProvider;

    @Autowired(ROUTER)
    protected readonly router: React.ComponentType;

    override render(): React.ReactNode {
        return this.createContextAndRouter();
    }

    protected createContextAndRouter() {
        let child = React.createElement(this.router);
        this.contextProvider.provide().forEach((context, index) => child = React.createElement(context, { key: index }, child));
        return child;
    }
}
