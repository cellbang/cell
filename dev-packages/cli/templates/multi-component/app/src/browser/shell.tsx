import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ApplicationShell } from '@malagu/core/lib/browser';
import { Component } from '@malagu/core';
import { App } from './app';

@Component({ id: ApplicationShell, rebind: true })
export class Shell implements ApplicationShell {

    attach(host: HTMLElement): void {
        ReactDOM.render(<App/>, host);
    }
}
