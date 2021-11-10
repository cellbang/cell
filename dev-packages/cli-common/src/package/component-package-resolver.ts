import { ApplicationPackage } from './application-package';
import { ComponentPackage } from './package-protocol';
import { EntryResolver } from './entry-resolver';
import { ModuleResolver } from './module-resolver';

export class ComponentPackageResolver {
    protected readonly moduleResolver = new ModuleResolver(this.pkg);

    constructor(protected readonly pkg: ApplicationPackage) {

    }

    resolve(componentPackage: ComponentPackage) {
        this.moduleResolver.resolve(componentPackage);
        new EntryResolver(this.pkg).resolve(componentPackage);
    }
}
