require('reflect-metadata');
import { ContainerProvider } from '../container/container-provider';
import { Application, ApplicationProps } from './application-protocol';
import './application';
import './application-state';
import { autoBind } from '../container/auto-bind';
import commonModule from '../static-module';
import { currentThis } from '../utils';
import { ContainerModule } from 'inversify';
import { ContainerFactory } from '../container/container-factory';

export class ApplicationFactory {
    static async create(applicationProps: ApplicationProps, ...modules: ContainerModule[]): Promise<Application> {
        currentThis.malaguProps = applicationProps;
        const container = ContainerFactory.create(commonModule, autoBind(), ...modules);
        ContainerProvider.set(container);
        const application = container.get<Application>(Application);
        return application;
    }
}
