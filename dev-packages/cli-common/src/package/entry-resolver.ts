import { ApplicationPackage } from './application-package';
import { ComponentPackage } from './package-protocol';
import { ModuleBuilder } from './module-builder';

export class EntryResolver {
    protected readonly moduleBuilder: ModuleBuilder;

    constructor(protected readonly pkg: ApplicationPackage) {
        this.moduleBuilder = new ModuleBuilder(pkg);
    }

    resolve(componentPackage: ComponentPackage) {
        const { malaguComponent } = componentPackage;
        if (malaguComponent) {
            malaguComponent.frontend.entry = this.doResolveEntry(componentPackage, malaguComponent.frontend.entry || malaguComponent.entry);
            malaguComponent.backend.entry = this.doResolveEntry(componentPackage, malaguComponent.backend.entry || malaguComponent.entry);
            malaguComponent.frontend.devEntry = this.doResolveEntry(componentPackage, malaguComponent.frontend.devEntry || malaguComponent.devEntry);
            malaguComponent.backend.devEntry = this.doResolveEntry(componentPackage, malaguComponent.backend.devEntry || malaguComponent.devEntry);
        }
    }

    protected doResolveEntry(componentPackage: ComponentPackage, entry: any) {
        if (entry) {
            return this.moduleBuilder.build(componentPackage, entry);
        }
    }

}
