export const RedirectStrategy = Symbol('RedirectStrategy');

export interface RedirectStrategy {
    send(url: string): Promise<void>;
}
