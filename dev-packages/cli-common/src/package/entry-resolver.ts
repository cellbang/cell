import { ApplicationPackage } from './application-package';
import { ComponentPackage } from './package-protocol';
import { ModulePathBuilder } from './module-path-builder';

export class EntryResolver {
    constructor(protected readonly pkg: ApplicationPackage) {

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
        const modulePathBuilder = new ModulePathBuilder(this.pkg);
        if (entry) {
            if (typeof entry === 'string') {
                return modulePathBuilder.build(componentPackage, entry);
            } else {
                const result: { [key: string]: string } = {};
                for (const key in entry) {
                    if (entry.hasOwnProperty(key)) {
                        result[key] = modulePathBuilder.build(componentPackage, entry[key]);
                    }
                }
                return result;
            }
        }
    }

}
