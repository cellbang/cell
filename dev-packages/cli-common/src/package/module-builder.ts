import { ApplicationPackage } from './application-package';
import { ComponentPackage, Module } from './package-protocol';
import { join, resolve, sep } from 'path';
import { existsSync } from 'fs-extra';

export class ModuleBuilder {
    constructor(protected readonly pkg: ApplicationPackage) {

    }

    protected buildPath(componentPackage: ComponentPackage, modulePath: string) {
        let realPath = modulePath;
        if (modulePath.startsWith('@')) {
            realPath = modulePath.split(sep).join('/');
        } else if (this.pkg.isRoot(componentPackage)) {
            realPath = join(this.pkg.projectPath, modulePath).split(sep).join('/');
        } else {
            realPath = join(componentPackage.name, modulePath).split(sep).join('/');
        }
        try {
           return this.pkg.resolveModule(realPath);
        } catch (error) {
            const projectPath = this.pkg.projectPath.split(sep).join('/');
            if (realPath.indexOf(projectPath) === 0 && existsSync(resolve(`${realPath}.ts`))) {
                return resolve(`${realPath}.ts`);
            } else if (realPath.indexOf(projectPath) === 0 && existsSync(resolve(realPath))) {
                return resolve(realPath);
            } else if (existsSync(resolve(this.pkg.resolveModulePath(componentPackage.name), modulePath))) {
                return resolve(this.pkg.resolveModulePath(componentPackage.name), modulePath);
            }
            throw Error(`Module not found: ${realPath}`);
        }
    }

    build(componentPackage: ComponentPackage, modulePath: string): Module {
        return {
            name: join(componentPackage.name, modulePath).split(sep).join('/'),
            path: this.buildPath(componentPackage, modulePath).split(sep).join('/'),
            componentName: componentPackage.name
        };
    }
}
