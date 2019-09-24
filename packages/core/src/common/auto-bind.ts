import { interfaces as inversifyInterfaces, ContainerModule } from 'inversify';
import interfaces from 'inversify-binding-decorators/dts/interfaces/interfaces';
import { METADATA_KEY } from './constants';
import { CustomError } from 'ts-custom-error';

class NoOpError extends CustomError {
}

export function autoBind(registry?: inversifyInterfaces.ContainerModuleCallBack): inversifyInterfaces.ContainerModule {
    return new ContainerModule((bind, unbind, isBound, rebind) => {
        const provideMetadata: interfaces.ProvideSyntax[] = Reflect.getMetadata(METADATA_KEY.provide, Reflect) || [];
        provideMetadata.map(metadata => resolve(metadata, bind, rebind));
        Reflect.defineMetadata(METADATA_KEY.provide, [], Reflect);
        if (registry) {
            registry(bind, unbind, isBound, rebind);
        }
    });
}

function resolve(metadata: interfaces.ProvideSyntax, bind: inversifyInterfaces.Bind, rebind: inversifyInterfaces.Rebind) {
    const isRebind: boolean = Reflect.getOwnMetadata(METADATA_KEY.rebind, metadata.implementationType);
    const id = Reflect.getOwnMetadata(METADATA_KEY.toService, metadata.implementationType);

    const bindWrapper = (serviceIdentifier: inversifyInterfaces.ServiceIdentifier<any>) => {
        if (id && id !== serviceIdentifier) {
            bind(serviceIdentifier).toService(id);
            throw new NoOpError();
        }
        if (isRebind) {
            return rebind(serviceIdentifier);
        }
        return bind(serviceIdentifier);
    };
    try {
        metadata.constraint(bindWrapper, metadata.implementationType);
    } catch (error) {
        if (error instanceof NoOpError) {
            return;
        }
        throw error;
    }
}
