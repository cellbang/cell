import { ApplicationPackage } from './application-package';
import { existsSync } from 'fs';
import { resolve } from 'path';

export class ModuleChecker {
    constructor(protected readonly pkg: ApplicationPackage) {

    }
    check(modulePath: string) {
        try {
            this.pkg.resolveModule(modulePath);
            return true;
        } catch (error) {
            if (modulePath.indexOf(this.pkg.projectPath) === 0 && existsSync(`${modulePath}.ts`)) {
                return true;
            } else if (modulePath.indexOf(this.pkg.projectPath) === 0 && existsSync(modulePath)) {
                return true;
            } else if (existsSync(resolve(this.pkg.projectPath, 'node_modules', modulePath))) {
                return true;
            } else {
                return false;
            }
        }
    }
}
