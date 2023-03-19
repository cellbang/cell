import { Container, ContainerModule, interfaces } from 'inversify';

export class ContainerFactory {
    static create(...modules: ContainerModule[]): interfaces.Container {
        const container = new Container({ skipBaseClassChecks: true });
        container.load(...modules);
        return container;
    }
}
