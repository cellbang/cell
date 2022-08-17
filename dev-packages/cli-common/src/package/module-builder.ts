import { ApplicationPackage } from './application-package';
import { ComponentPackage, Module } from './package-protocol';
import { join, resolve, sep } from 'path';
import { existsSync } from 'fs-extra';
import { EMPTY } from '../constants';

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
            if (realPath.indexOf(projectPath) === 0) {
                if (existsSync(resolve(`${realPath}.ts`))) {
                    return resolve(`${realPath}.ts`);
                } else if (existsSync(resolve(realPath))) {
                    return resolve(realPath);
                } else if (this.pkg.projectPath !== process.cwd()) {
                    realPath = join(process.cwd(), modulePath).split(sep).join('/');
                    if (existsSync(realPath)) {
                        return realPath;
                    } else if (existsSync(`${realPath}.js`)) {
                        return `${realPath}.js`;
                    } else if (existsSync(`${realPath}.ts`)) {
                        return `${realPath}.ts`;
                    }
                }
            } else if (realPath.indexOf(process.cwd()) === 0) {
                if (existsSync(resolve(`${realPath}.ts`))) {
                    return resolve(`${realPath}.ts`);
                } else if (existsSync(resolve(realPath))) {
                    return resolve(realPath);
                }
            } else if (existsSync(resolve(this.pkg.resolveModulePath(componentPackage.name), modulePath))) {
                return resolve(this.pkg.resolveModulePath(componentPackage.name), modulePath);
            }
            throw Error(`Module not found: ${realPath}`);
        }
    }

    build(componentPackage: ComponentPackage, modulePath: string): Module {
        return {
            name: (modulePath.startsWith('@') ? modulePath : join(componentPackage.name, modulePath)).split(sep).join('/'),
            path: modulePath === EMPTY ?  EMPTY : this.buildPath(componentPackage, modulePath).split(sep).join('/'),
            componentName: componentPackage.name
        };
    }
}
