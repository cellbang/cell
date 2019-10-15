import { ApplicationPackage } from './application-package';
import { ComponentPackage } from './package-protocol';
import { join, resolve, sep } from 'path';

export class ModulePathBuilder {
    constructor(protected readonly pkg: ApplicationPackage) {

    }

    build(componentPackage: ComponentPackage, modulePath: string) {
        if (this.pkg.isRoot(componentPackage)) {
            return join(resolve(this.pkg.projectPath), modulePath).split(sep).join('/');
        } else {
            return join(componentPackage.name, modulePath).split(sep).join('/');
        }
    }
}
