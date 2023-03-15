import { Component, ComponentId } from '../annotation/component';
import { Provider, ProviderCreator } from './provider-protocol';
import { Container } from '../container';
import { ContainerBasedProvider } from './provider';

@Component(ProviderCreator)
export class ProviderCreatorImpl<T extends Object> implements ProviderCreator<T> {
    create(id: ComponentId, container: Container): Provider<T> {
        return new ContainerBasedProvider(id, container) as Provider<T>;
    }
}

