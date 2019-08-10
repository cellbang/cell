import { interfaces as inversifyInterfaces, ContainerModule } from 'inversify';
import interfaces from 'inversify-binding-decorators/dts/interfaces/interfaces';
import { METADATA_KEY } from './constants';

export function autoBind(): inversifyInterfaces.ContainerModule {
    return new ContainerModule((bind, unbind, isBound, rebind) => {
        const provideMetadata: interfaces.ProvideSyntax[] = (Reflect as any).getMetadata(METADATA_KEY.provide, Reflect) || [];
        provideMetadata.map(metadata => resolve(metadata, bind, rebind));
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
