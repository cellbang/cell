import { Component } from '../common/annotation';

export const ApplicationShell = Symbol('ApplicationShell');
export interface ApplicationShell {
    attach(host: HTMLElement): void;
}

@Component(ApplicationShell)
export class ApplicationShellImpl implements ApplicationShell {
    attach(host: HTMLElement): void {
        host.textContent = 'Hello, Malagu.';
    }

}
