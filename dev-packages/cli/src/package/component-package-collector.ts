import { readJsonFile } from './json-file';
import { NodePackage, PublishedNodePackage } from './npm-registry';
import { ComponentPackage, RawComponentPackage, customizer } from './package-protocol';
import yaml = require('js-yaml');
import { readFileSync } from 'fs';
import { CONFIG_FILE } from '../constants';
import mergeWith = require('lodash.mergewith');

export class ComponentPackageCollector {

    protected readonly sorted: ComponentPackage[] = [];
    protected readonly visited = new Map<string, boolean>();

    constructor(
        protected readonly componentPackageFactory: (raw: PublishedNodePackage) => ComponentPackage,
        protected readonly resolveModule: (modulePath: string) => string,
        protected readonly mode?: string
    ) { }

    protected root: NodePackage;
    collect(pck: NodePackage): ComponentPackage[] {
        this.root = pck;
        this.collectPackages(pck);
        return this.sorted;
    }

    protected collectPackages(pck: NodePackage): void {
        if (!pck.dependencies) {
            return;
        }
        // tslint:disable-next-line:forin
        for (const dependency in pck.dependencies) {
            const versionRange = pck.dependencies[dependency]!;
            this.collectPackage(dependency, versionRange);
        }
    }

    protected parent: ComponentPackage | undefined;
    protected collectPackagesWithParent(pck: NodePackage, parent: ComponentPackage): void {
        const current = this.parent;
        this.parent = parent;
        this.collectPackages(pck);
        this.parent = current;
    }

    protected collectPackage(name: string, versionRange: string): void {
        if (this.visited.has(name)) {
            return;
        }
        this.visited.set(name, true);

        let packagePath: string | undefined;
        try {
            packagePath = this.resolveModule(name + '/package.json');
        } catch (error) {
            console.warn(`Failed to resolve module: ${name}`);
        }
        if (!packagePath) {
            return;
        }
        const pck: NodePackage = readJsonFile(packagePath);
        if (RawComponentPackage.is(pck)) {
            pck.version = versionRange;
            pck.malaguComponent = {} as any;
            let configPath: string | undefined = undefined;
            try {
                configPath = this.resolveModule(name + `/${CONFIG_FILE}`);

            } catch (err) {
                // noop
            }
            if (configPath) {
                pck.malaguComponent = { ...pck.malaguComponent, ...yaml.safeLoad(readFileSync(configPath, { encoding: 'utf8' })) };
            }
            if (this.mode) {

                let configPathForMode: string | undefined = undefined;

                try {
                    configPathForMode = this.resolveModule(name + `/malagu-${this.mode}.yml`);

                } catch (err) {
                    // noop
                }
                if (configPathForMode) {
                    const configForMode = yaml.safeLoad(readFileSync(configPathForMode, { encoding: 'utf8' }));
                    pck.malaguComponent = mergeWith(pck.malaguComponent, configForMode, customizer);
                }
            }

            const componentPackage = this.componentPackageFactory(pck);
            this.collectPackagesWithParent(pck, componentPackage);
            this.sorted.push(componentPackage);
        }
    }

}
