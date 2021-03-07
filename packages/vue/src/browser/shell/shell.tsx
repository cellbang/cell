import { ApplicationShell } from '@malagu/core/lib/browser';
import { Component, Autowired } from '@malagu/core';
import { App } from 'vue';
import { APP } from '../annotation';

@Component({ id: ApplicationShell, rebind: true })
export class Shell implements ApplicationShell {

    @Autowired(APP)
    protected readonly app: App<Element>;

    attach(host: HTMLElement): void {
        this.app.mount(host);
    }
}
