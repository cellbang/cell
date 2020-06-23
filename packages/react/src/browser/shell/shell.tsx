import { ApplicationShell } from '@malagu/core/lib/browser';
import { Component, Autowired } from '@malagu/core';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { APP } from '../app';

@Component({ id: ApplicationShell, rebind: true })
export class Shell implements ApplicationShell {

    @Autowired(APP)
    protected readonly app: React.ComponentType<any>;

    attach(host: HTMLElement): void {
        ReactDOM.render(<this.app/>, host);
    }
}
