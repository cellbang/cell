import { interfaces } from 'inversify';
import { ContainerProvider } from './container-provider';

export namespace ContainerUtil {
    export function get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return ContainerProvider.provide().get(serviceIdentifier);
    }

    export function getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
        return ContainerProvider.provide().getAll(serviceIdentifier);
    }

    export function getAllNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T[] {
        return ContainerProvider.provide().getAllNamed(serviceIdentifier, named);
    }

    export function getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T {
        return ContainerProvider.provide().getNamed(serviceIdentifier, named);
    }

    export function getAllTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: any): T[] {
        return ContainerProvider.provide().getAllTagged(serviceIdentifier, key, value);
    }

    export function getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: any): T {
        return ContainerProvider.provide().getTagged(serviceIdentifier, key, value);
    }

    export function getContainerDictionary(container: interfaces.Container): interfaces.Lookup<interfaces.Binding<any>> {
        // @ts-expect-error
        return container['_bindingDictionary'];
    }

    export function getContainerDictionaryMap(container: interfaces.Container): Map<interfaces.ServiceIdentifier<any>, interfaces.Binding<any>[]> {
        const dictionary = getContainerDictionary(container);
        // @ts-expect-error
        return dictionary['_map']
    }
}
