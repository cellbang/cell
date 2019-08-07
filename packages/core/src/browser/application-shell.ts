import { injectable } from 'inversify';

export const ApplicationShell = Symbol('ApplicationShell');
export interface ApplicationShell {
    attach(host: HTMLElement): void;
}

@injectable()
export class ApplicationShellImpl implements ApplicationShell {
    attach(host: HTMLElement): void {
        host.textContent = 'Hello, Malagu.';
    }

}
