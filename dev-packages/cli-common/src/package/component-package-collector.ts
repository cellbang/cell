import { readJsonFile } from './json-file';
import { NodePackage } from './npm-registry';
import { ComponentPackage, RawComponentPackage } from './package-protocol';
import { ApplicationPackage } from './application-package';
import { ComponentPackageLoader } from './component-package-loader';

export class ComponentPackageCollector {

    protected readonly sorted: ComponentPackage[] = [];
    protected readonly visited = new Map<string, boolean>();
    protected componentPackageLoader: ComponentPackageLoader;

    constructor(
        protected readonly pkg: ApplicationPackage,
        protected readonly mode: string[]
    ) {
        this.componentPackageLoader = new ComponentPackageLoader(pkg);
    }

    protected root: NodePackage;
    collect(pck: NodePackage): ComponentPackage[] {
        this.root = pck;
        this.collectPackages(pck, this.mode);
        return this.sorted;
    }

    protected isPlugin(pck: NodePackage): boolean {

        if (pck.keywords?.includes('malagu-plugin')) {
            return true;
        }
        return false;
    }

    protected collectPackages(pck: NodePackage, mode: string[]): void {
        if (!pck.dependencies) {
            return;
        }

        // eslint-disable-next-line guard-for-in
        for (const dependency in pck.dependencies) {
            const versionRange = pck.dependencies[dependency]!;
            this.collectPackage(dependency, versionRange, mode, false);
        }

        if (this.pkg.pkg.name === pck.name) {
            // eslint-disable-next-line guard-for-in
            for (const dependency in pck.devDependencies) {
                const versionRange = pck.devDependencies[dependency]!;
                this.collectPackage(dependency, versionRange, mode, true);
            }
        }
    }

    protected parent: ComponentPackage | undefined;
    protected collectPackagesWithParent(pck: NodePackage, parent: ComponentPackage): void {
        const current = this.parent;
        this.parent = parent;
        this.collectPackages(pck, parent.malaguComponent?.mode || []);
        this.parent = current;
    }

    protected collectPackage(name: string, versionRange: string, mode: string[], dev: boolean): void {
        if (this.visited.has(name)) {
            return;
        }
        this.visited.set(name, true);

        let packagePath: string | undefined;
        try {
            packagePath = this.pkg.resolveModule(name + '/package.json');
        } catch (error) {
            if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
                // console.warn(`Failed to resolve module: ${name}`);
            }
        }
        if (!packagePath) {
            return;
        }
        const pck: NodePackage = readJsonFile(packagePath);
        if (RawComponentPackage.is(pck) && (this.pkg.dev || (!dev || this.isPlugin(pck)))) {
            pck.version = versionRange;
            pck.malaguComponent = {} as any;
            this.componentPackageLoader.load(pck, mode);
            const componentPackage = this.pkg.newComponentPackage(pck);
            this.collectPackagesWithParent(pck, componentPackage);
            delete componentPackage.malaguComponent?.mode;
            this.sorted.push(componentPackage);
        }
    }

}
