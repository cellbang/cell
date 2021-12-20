import * as paths from 'path';
import { readJsonFile } from './json-file';
import { Dependencies, NodePackage, PublishedNodePackage, sortByKey } from './npm-registry';
import { ComponentPackage, ApplicationLog, ApplicationPackageOptions, ApplicationModuleResolver, RawComponentPackage } from './package-protocol';
import { ComponentPackageCollector } from './component-package-collector';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { Settings } from '../settings/settings-protocol';
import { ComponentPackageLoader } from './component-package-loader';
import { Module } from './package-protocol';

import { ComponentPackageResolver } from './component-package-resolver';
import { existsSync } from 'fs-extra';
import { PathUtil, ConfigUtil } from '../utils';
import { Framework } from '@malagu/frameworks';

// tslint:disable:no-implicit-dependencies

// tslint:disable-next-line:no-any

export class ApplicationPackage {
    readonly projectPath: string;
    readonly dev: boolean;
    readonly settings?: Settings;
    readonly runtime?: string;
    readonly framework?: Framework;
    readonly log: ApplicationLog;
    readonly error: ApplicationLog;
    protected componentPackageLoader = new ComponentPackageLoader(this);
    protected componentPackageResolver = new ComponentPackageResolver(this);

    constructor(
        protected readonly options: ApplicationPackageOptions
    ) {
        this.projectPath = options.projectPath;
        this.dev = options.dev;
        this.runtime = options.runtime;
        this.settings = options.settings;
        this.framework = options.framework;

        this.log = options.log || console.log.bind(console);
        this.error = options.error || console.error.bind(console);
    }

    static create(options: ApplicationPackageOptions) {
        let pkg = new ApplicationPackage(options);
        if (!RawComponentPackage.is(pkg.pkg)) {
            const { malagu } = pkg.pkg;
            if (malagu && malagu.rootComponent) {
                pkg = new ApplicationPackage({ ...options, projectPath: paths.join(options.projectPath, malagu.rootComponent) });
            }
        }
        return pkg;
    }

    protected _pkg: PublishedNodePackage | undefined;
    get pkg(): PublishedNodePackage {
        if (!this._pkg) {
            if (existsSync(this.packagePath)) {
                this._pkg = readJsonFile(this.packagePath);
            } else {
                this._pkg = {} as PublishedNodePackage;
            }
            if (process.cwd() !== this.projectPath) {
                const cwdPackagePath = paths.join(process.cwd(), 'package.json');
                if (existsSync(cwdPackagePath)) {
                    const tmp = readJsonFile(cwdPackagePath);
                    this._pkg!.name = tmp.name || paths.basename(process.cwd());
                    this._pkg!.version = tmp.version || 'latest';
                    this._pkg!.main = tmp.main;
                    this._pkg!.devDependencies = tmp.devDependencies as Dependencies;
                    this._pkg!.dependencies = tmp.dependencies as Dependencies;
                } else {
                    this._pkg!.name = paths.basename(process.cwd());
                    this._pkg!.devDependencies = {};
                    this._pkg!.dependencies = {};
                }
            } else {
                this._pkg!.name = this._pkg!.name || paths.basename(this.projectPath);
                this._pkg!.version = this._pkg!.version || 'latest';
            }
            this._pkg!.version = this._pkg!.version || 'latest';
        }
        return this._pkg!;
    }

    protected _frontendModules: Module[] | undefined;
    protected _backendModules: Module[] | undefined;
    protected _frontendStaticModules: Module[] | undefined;
    protected _backendStaticModules: Module[] | undefined;
    protected _frontendAssets: Module[] | undefined;
    protected _backendAssets: Module[] | undefined;
    protected _initHookModules: Module[] | undefined;
    protected _buildHookModules: Module[] | undefined;
    protected _serveHookModules: Module[] | undefined;
    protected _deployHookModules: Module[] | undefined;
    protected _componentPackages: ComponentPackage[] | undefined;
    protected _webpackHookModules: Module[] | undefined;
    protected _configHookModules: Module[] | undefined;
    protected _propsHookModules: Module[] | undefined;
    protected _cliHookModules: Module[] | undefined;
    protected _infoHookModules: Module[] | undefined;
    protected _rootComponentPackage: ComponentPackage;

    get rootComponentPackage() {
        if (!this._rootComponentPackage) {
            this.pkg.malaguComponent = {};
            this.pkg.modulePath = this.projectPath;
            if (process.cwd() !== this.projectPath) {
                const virtualPkg = { malaguComponent: { mode: [] }, modulePath: process.cwd() };
                this.componentPackageLoader.load(virtualPkg, this.options.mode);
                this.componentPackageLoader.load(this.pkg, virtualPkg.malaguComponent.mode || []);
                this.pkg.malaguComponent = ConfigUtil.merge(this.pkg.malaguComponent, virtualPkg.malaguComponent, { mode: this.pkg.malaguComponent.mode });
            } else {
                this.componentPackageLoader.load(this.pkg, this.options.mode);
            }
            this._rootComponentPackage = this.newComponentPackage(this.pkg);
        }
        return this._rootComponentPackage;
    }

    /**
     * Component packages in the topological order.
     */
    get componentPackages(): ReadonlyArray<ComponentPackage> {
        if (!this._componentPackages) {
            const mode = this.rootComponentPackage.malaguComponent!.mode!;
            const components = this.rootComponentPackage.malaguComponent!.components;
            const devComponents = this.rootComponentPackage.malaguComponent!.devComponents;

            const collector = new ComponentPackageCollector(this, mode);
            if (components || devComponents) {
                const dependencies = components || {};
                const  devDependencies = devComponents || {};
                this._componentPackages = collector.collect({
                    ...this.pkg,
                    dependencies: { ...dependencies, ...this.pkg.dependencies },
                    devDependencies: { ...devDependencies, ...this.pkg.devDependencies }
                });
            } else {
                this._componentPackages = collector.collect(this.pkg);
            }
            this._componentPackages.push(this.rootComponentPackage);
            for (const componentPackage of this._componentPackages) {
                this.componentPackageResolver.resolve(componentPackage);
            }

        }

        return this._componentPackages;
    }

    getComponentPackage(component: string): ComponentPackage | undefined {
        return this.componentPackages.find(pkg => pkg.name === component);
    }

    async findComponentPackage(component: string): Promise<ComponentPackage | undefined> {
        return this.getComponentPackage(component);
    }

    newComponentPackage(raw: PublishedNodePackage): ComponentPackage {
        raw.malaguComponent = raw.malaguComponent || {};
        raw.malaguComponent.frontend = raw.malaguComponent.frontend || {};
        raw.malaguComponent.backend = raw.malaguComponent.backend || {};
        raw.malaguComponent.configFiles = raw.malaguComponent.configFiles || [];
        return new ComponentPackage(raw);
    }

    get frontendModules(): Module[] {
        if (!this._frontendModules) {
            this._frontendModules = this.computeModules('modules', FRONTEND_TARGET);
        }
        return this._frontendModules;
    }

    get backendModules(): Module[] {
        if (!this._backendModules) {
            this._backendModules = this.computeModules('modules', BACKEND_TARGET);
        }
        return this._backendModules;
    }

    get frontendStaticModules(): Module[] {
        if (!this._frontendStaticModules) {
            this._frontendStaticModules = this.computeModules('staticModules', FRONTEND_TARGET);
        }
        return this._frontendStaticModules;
    }

    get backendStaticModules(): Module[] {
        if (!this._backendStaticModules) {
            this._backendStaticModules = this.computeModules('staticModules', BACKEND_TARGET);
        }
        return this._backendStaticModules;
    }

    get frontendAssets(): Module[] {
        if (!this._frontendAssets) {
            this._frontendAssets = this.computeModules('assets', FRONTEND_TARGET);
        }
        return this._frontendAssets;
    }

    get backendAssets(): Module[] {
        if (!this._backendAssets) {
            this._backendAssets = this.computeModules('assets', BACKEND_TARGET);
        }
        return this._backendAssets;
    }

    get cliHookModules() {
        if (!this._cliHookModules) {
            this._cliHookModules = this.computeModules('cliHooks');
        }
        return this._cliHookModules;
    }

    get infoHookModules() {
        if (!this._infoHookModules) {
            this._infoHookModules = this.computeModules('infoHooks');
        }
        return this._infoHookModules;
    }

    get initHookModules() {
        if (!this._initHookModules) {
            this._initHookModules = this.computeModules('initHooks');
        }
        return this._initHookModules;
    }

    get configHookModules() {
        if (!this._configHookModules) {
            this._configHookModules = this.computeModules('configHooks');
        }
        return this._configHookModules;
    }

    get propsHookModules() {
        if (!this._propsHookModules) {
            this._propsHookModules = this.computeModules('propsHooks');
        }
        return this._propsHookModules;
    }

    get buildHookModules() {
        if (!this._buildHookModules) {
            this._buildHookModules = this.computeModules('buildHooks');
        }
        return this._buildHookModules;
    }

    get serveHookModules() {
        if (!this._serveHookModules) {
            this._serveHookModules = this.computeModules('serveHooks');
        }
        return this._serveHookModules;
    }

    get deployHookModules() {
        if (!this._deployHookModules) {
            this._deployHookModules = this.computeModules('deployHooks');
        }
        return this._deployHookModules;
    }

    get webpackHookModules() {
        if (!this._webpackHookModules) {
            this._webpackHookModules = this.computeModules('webpackHooks');
        }
        return this._webpackHookModules;
    }

    isRoot(componentPackage: ComponentPackage | NodePackage) {
        if (componentPackage.modulePath) {
            return true;
        }
        return false;
    }

    computeModules(type: string, target?: string): Module[] {
        const result: Module[] = [];
        const moduleMap = new Map<string, boolean>();
        for (const componentPackage of this.componentPackages) {
            const component = componentPackage.malaguComponent;
            if (component) {
                const modules: Module[] = (target ? component[target][type] : component[type]) || [];
                for (const m of modules) {
                    if (typeof m === 'object') {
                        if (moduleMap.get(m.name)) {
                            continue;
                        }
                        moduleMap.set(m.name, true);
                        result.push(m);
                    }
                }
            }
        }
        return result;
    }

    relative(path: string): string {
        return paths.relative(this.projectPath, path);
    }

    path(...segments: string[]): string {
        return paths.resolve(this.projectPath, ...segments);
    }

    get packagePath(): string {
        return this.path('package.json');
    }

    lib(...segments: string[]): string {
        return this.path('lib', ...segments);
    }

    setDependency(name: string, version: string | undefined): boolean {
        const dependencies = this.pkg.dependencies || {};
        const currentVersion = dependencies[name];
        if (currentVersion === version) {
            return false;
        }
        if (version) {
            dependencies[name] = version;
        } else {
            delete dependencies[name];
        }
        this.pkg.dependencies = sortByKey(dependencies);
        return true;
    }

    protected _moduleResolver: undefined | ApplicationModuleResolver;
    /**
     * A node module resolver in the context of the application package.
     */
    get resolveModule(): ApplicationModuleResolver {
        if (!this._moduleResolver) {
            let resolutionPaths = [this.packagePath || `${PathUtil.getRuntimePath(this.options.runtime)}/package.json`];
            const cwdPackagePath = `${process.cwd()}/package.json`;
            if (cwdPackagePath !== this.packagePath) {
                resolutionPaths = [cwdPackagePath, ...resolutionPaths];
            }
            this._moduleResolver = modulePath => require.resolve(modulePath, { paths: resolutionPaths });
        }
        return this._moduleResolver!;
    }

    resolveModulePath(moduleName: string, ...segments: string[]): string {
        return paths.resolve(this.resolveModule(moduleName + '/package.json'), '..', ...segments);
    }

}
