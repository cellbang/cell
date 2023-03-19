import { interfaces } from 'inversify';
import { Deferred } from '../utils';

let _container: interfaces.Container;

const _containerDeferred = new Deferred<interfaces.Container>();

export namespace ContainerProvider {
    export function set(container: interfaces.Container): void {
        _container = container;
        _containerDeferred.resolve(container);
    }
    export function provide(): interfaces.Container {
        if (!_container) {
            throw new Error('Container is not ready yet, the timing is incorrect.');
        }
        return _container;
    }

    export function asyncProvide(): Promise<interfaces.Container> {
        return _containerDeferred.promise;
    }
}
