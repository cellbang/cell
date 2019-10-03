import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ApplicationShell } from '@malagu/core/lib/browser/application-shell';
import { component } from '@malagu/core';
import { App } from './app';

@component({ id: ApplicationShell, rebind: true })
export class Shell implements ApplicationShell {

    attach(host: HTMLElement): void {
        ReactDOM.render(<App/>, host);
    }
}
