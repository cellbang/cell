import { ApplicationPackage } from './application-package';
import { ComponentPackage } from './package-protocol';
import { ModuleBuilder } from './module-builder';

export class EntryResolver {
    protected readonly moduleBuilder: ModuleBuilder;

    constructor(protected readonly pkg: ApplicationPackage) {
        this.moduleBuilder = new ModuleBuilder(pkg);
    }

    resolve(componentPackage: ComponentPackage) {
        const { cellComponent } = componentPackage;
        if (cellComponent) {
            cellComponent.frontend.entry = this.doResolveEntry(componentPackage, cellComponent.frontend.entry || cellComponent.entry);
            cellComponent.backend.entry = this.doResolveEntry(componentPackage, cellComponent.backend.entry || cellComponent.entry);
            cellComponent.frontend.devEntry = this.doResolveEntry(componentPackage, cellComponent.frontend.devEntry || cellComponent.devEntry);
            cellComponent.backend.devEntry = this.doResolveEntry(componentPackage, cellComponent.backend.devEntry || cellComponent.devEntry);
        }
    }

    protected doResolveEntry(componentPackage: ComponentPackage, entry: any) {
        if (entry) {
            return this.moduleBuilder.build(componentPackage, entry);
        }
    }

}
