import { interfaces as inversifyInterfaces, ContainerModule } from 'inversify';
import interfaces from 'inversify-binding-decorators/dts/interfaces/interfaces';
import { METADATA_KEY } from './constants';

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
    const isRebind: boolean = (Reflect as any).getMetadata(METADATA_KEY.rebind, metadata.implementationType);

    const bindWrapper = (serviceIdentifier: inversifyInterfaces.ServiceIdentifier<any>) => {
        if (isRebind) {
            return rebind(serviceIdentifier);
        }
        return bind(serviceIdentifier);
    };
    return metadata.constraint(bindWrapper, metadata.implementationType);
}
