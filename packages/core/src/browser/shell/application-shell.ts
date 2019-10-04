import { Component } from '../../common';
import { ApplicationShell } from './shell-protocol';

@Component(ApplicationShell)
export class ApplicationShellImpl implements ApplicationShell {
    attach(host: HTMLElement): void {
        host.textContent = 'Hello, Malagu.';
    }

}
