export const ApplicationShell = Symbol('ApplicationShell');

export interface ApplicationShell {
    attach(host: HTMLElement): void;
}
