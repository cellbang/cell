import { ApplicationPackage } from './application-package';
import { ComponentPackage, Component } from './package-protocol';
import { EntryResolver } from './entry-resolver';
import { ModuleResolver } from './module-resolver';
const chalk = require('chalk');

export class ComponentPackageResolver {
    protected readonly moduleResolver = new ModuleResolver(this.pkg);

    constructor(protected readonly pkg: ApplicationPackage) {

    }

    resolve(componentPackage: ComponentPackage) {
        console.log(chalk`malagu {green.bold component} - ${ componentPackage.name }@${ componentPackage.version }`);
        const malaguComponent = <Component>componentPackage.malaguComponent;
        if (malaguComponent.auto !== false) {
            this.moduleResolver.resolve(componentPackage);
        }
        delete malaguComponent.auto;
        new EntryResolver(this.pkg).resolve(componentPackage);
    }
}
