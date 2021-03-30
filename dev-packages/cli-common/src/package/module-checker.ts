import { ApplicationPackage } from './application-package';
import { existsSync } from 'fs';
import { resolve, sep } from 'path';

export class ModuleChecker {
    constructor(protected readonly pkg: ApplicationPackage) {

    }
    check(modulePath: string) {
        try {
            this.pkg.resolveModule(modulePath);
            return true;
        } catch (error) {
            const projectPath = this.pkg.projectPath.split(sep).join('/');
            if (modulePath.indexOf(projectPath) === 0 && existsSync(resolve(`${modulePath}.ts`))) {
                return true;
            } else if (modulePath.indexOf(projectPath) === 0 && existsSync(resolve(modulePath))) {
                return true;
            } else if (existsSync(resolve(this.pkg.projectPath, 'node_modules', modulePath))) {
                return true;
            } else {
                return false;
            }
        }
    }
}
