import { ApplicationShell } from '@malagu/core/lib/browser';
import { Component, Autowired } from '@malagu/core';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { App } from '../app/app-protocol';

@Component({ id: ApplicationShell, rebind: true })
export class Shell implements ApplicationShell {

    @Autowired(App)
    protected readonly app: new() => App;

    attach(host: HTMLElement): void {
        ReactDOM.render(<this.app/>, host);
    }
}
