import { Container } from 'inversify';
import { Deferred } from '../utils';

let _container: Container;

const _containerDeferred = new Deferred<Container>();

export namespace ContainerProvider {
    export function set(container: Container): void {
        _container = container;
        _containerDeferred.resolve(container);
    }
    export function provide(): Container {
        if (!_container) {
            throw new Error('Container is not ready yet, the timing is incorrect.');
        }
        return _container;
    }

    export function asyncProvide(): Promise<Container> {
        return _containerDeferred.promise;
    }
}
