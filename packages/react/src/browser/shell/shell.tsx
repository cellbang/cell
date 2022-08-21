import { ApplicationShell } from '@malagu/core/lib/browser';
import { Component, Autowired } from '@malagu/core';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { APP } from '../app';

@Component({ id: ApplicationShell, rebind: true })
export class Shell implements ApplicationShell {

    @Autowired(APP)
    protected readonly app: React.ComponentType;

    attach(host: HTMLElement): void {
        createRoot(host).render(React.createElement(this.app));
    }
}
