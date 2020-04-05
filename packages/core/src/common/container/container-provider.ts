import { Container } from 'inversify';

let _container: Container;

export namespace ContainerProvider {
    export function set(container: Container): void {
        _container = container;
    }
    export function provide(): Container {
        if (!_container) {
            throw new Error('Container is not ready yet, the timing is incorrect.');
        }
        return _container;
    }
}
