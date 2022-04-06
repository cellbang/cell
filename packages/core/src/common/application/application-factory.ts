require('reflect-metadata');
import { Container, ContainerModule } from 'inversify';
import { ContainerProvider } from '../container/container-provider';
import { Application, ApplicationProps } from './application-protocol';
import './application';
import './application-state';
import { autoBind } from '../container/auto-bind';
import commonModule from '../static-module';

export class ApplicationFactory {
    static async create(applicationProps: ApplicationProps, ...modules: ContainerModule[]): Promise<Application> {
        (global as any).malaguProps = applicationProps;
        const container = new Container({ skipBaseClassChecks: true });
        container.load(commonModule, autoBind(), ...modules);
        ContainerProvider.set(container);
        const application = container.get<Application>(Application);
        return application;
    }
}
