import * as paths from 'path';
import { readJsonFile } from './json-file';
import { NodePackage, PublishedNodePackage, sortByKey } from './npm-registry';
import { Component, ComponentPackage, Props, ApplicationLog, ApplicationPackageOptions, customizer, ApplicationModuleResolver } from './package-protocol';
import { ComponentPackageCollector } from './component-package-collector';
import mergeWith = require('lodash.mergewith');
import { FRONTEND_TARGET, BACKEND_TARGET, CONFIG_FILE } from '../constants';
import { ComponentPackageLoader } from './component-config-loader';
import { ComponentPackageResolver } from './component-package-resolver';
import { existsSync, readFileSync } from 'fs-extra';
const chalk = require('chalk');
import yaml = require('js-yaml');

// tslint:disable:no-implicit-dependencies

// tslint:disable-next-line:no-any

export class ApplicationPackage {
    readonly projectPath: string;
    readonly log: ApplicationLog;
    readonly error: ApplicationLog;
    protected componentPackageLoader = new ComponentPackageLoader(this);
    protected componentPackageResolver = new ComponentPackageResolver(this);

    constructor(
        protected readonly options: ApplicationPackageOptions
    ) {
        this.projectPath = options.projectPath;
        this.log = options.log || console.log.bind(console);
        this.error = options.error || console.error.bind(console);
    }

    protected _props: Component | undefined;
    get props(): Component {
        if (this._props) {
            return this._props;
        }
        let props = <Component>{};
        for (const componentPackage of this.componentPackages) {
            const component = componentPackage.malaguComponent;
            if (component) {
                props = mergeWith(props, component, customizer);
            }
        }

        return props;
    }

    protected _rootConfig: Props | undefined;
    get rootConfig(): Props {
        if (this._rootConfig) {
            return this._rootConfig;
        }
        if (existsSync(this.path(CONFIG_FILE))) {
            this._rootConfig = yaml.safeLoad(readFileSync(this.path(CONFIG_FILE), { encoding: 'utf8' }));
        }
        if (this._rootConfig && !this._rootConfig.malagu) {
            this._rootConfig.malagu = {};
        }
        return this._rootConfig || { malagu: {} };
    }

    protected _frontendConfig: Props | undefined;
    get frontendConfig(): Props {
        if (this._frontendConfig) {
            return this._frontendConfig;
        }
        const config = { ...this.props };
        delete config.backend;
        delete config.frontend;
        this._frontendConfig = mergeWith(config, this.props.frontend, customizer);
        return this._frontendConfig;
    }

    protected _backendConfig: Props | undefined;
    get backendConfig(): Props {
        if (this._backendConfig) {
            return this._backendConfig;
        }
        const config = { ...this.props };
        delete config.backend;
        delete config.frontend;
        this._backendConfig = mergeWith(config, this.props.backend, customizer);
        return this._backendConfig;
    }

    protected _pkg: PublishedNodePackage | undefined;
    get pkg(): PublishedNodePackage {
        if (!this._pkg) {
            this._pkg = readJsonFile(this.packagePath);
            this._pkg!.name = this._pkg!.name || paths.basename(this.projectPath);
            this._pkg!.name = this._pkg!.name || 'latest';
        }
        return this._pkg!;
    }

    protected _frontendModules: Map<string, string> | undefined;
    protected _backendModules: Map<string, string> | undefined;
    protected _initHookModules: Map<string, string> | undefined;
    protected _buildHookModules: Map<string, string> | undefined;
    protected _serveHookModules: Map<string, string> | undefined;
    protected _deployHookModules: Map<string, string> | undefined;
    protected _componentPackages: ComponentPackage[] | undefined;
    protected _webpackHookModules: Map<string, string> | undefined;
    protected _rootComponentPackage: ComponentPackage;

    protected rootComponentPackage() {
        if (!this._rootComponentPackage) {
            this.pkg.malaguComponent = {};
            this.componentPackageLoader.load(this.pkg, this.options.mode);
            this._rootComponentPackage = this.newComponentPackage(this.pkg);
        }
        return this._rootComponentPackage;
    }

    /**
     * Component packages in the topological order.
     */
    get componentPackages(): ReadonlyArray<ComponentPackage> {
        if (!this._componentPackages) {
            let modeForConfig = this.rootComponentPackage().malaguComponent!.mode;
            modeForConfig = Array.isArray(modeForConfig) ? modeForConfig : modeForConfig ? [modeForConfig] : [];
            const modeForOption = this.options.mode;
            const merged = Array.from(new Set<string>([...modeForConfig, ...modeForOption]));

            for (const mode of merged) {
                console.log(chalk`malagu {yellow.bold mode} - ${mode}`);
            }

            const collector = new ComponentPackageCollector(
                this,
                merged
            );
            this._componentPackages = collector.collect(this.pkg);
            this._componentPackages.push(this.rootComponentPackage());
            for (const componentPackage of this._componentPackages) {
                this.componentPackageResolver.resolve(componentPackage);
            }

            for (const componentPackage of this._componentPackages) {
                const malaguComponent = <Component>componentPackage.malaguComponent;
                for (const modulePath of [...malaguComponent.frontend.modules || [], ...malaguComponent.backend.modules || []]) {
                    console.log(chalk`malagu {cyan.bold module} - ${componentPackage.name}/${ modulePath }`);
                }
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
        return new ComponentPackage(raw);
    }

    get frontendModules(): Map<string, string> {
        if (!this._frontendModules) {
            this._frontendModules = this.computeModules('modules', FRONTEND_TARGET);
        }
        return this._frontendModules;
    }

    get backendModules(): Map<string, string> {
        if (!this._backendModules) {
            this._backendModules = this.computeModules('modules', BACKEND_TARGET);
        }
        return this._backendModules;
    }

    get initHookModules() {
        if (!this._initHookModules) {
            this._initHookModules = this.computeModules('initHooks');
        }
        return this._initHookModules;
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
        if (componentPackage.name === this.pkg.name) {
            return true;
        }
        return false;
    }

    computeModules(type: string, target?: string): Map<string, string> {
        const result = new Map<string, string>();
        let moduleIndex = 1;
        for (const componentPackage of this.componentPackages) {
            const component = componentPackage.malaguComponent;
            if (component) {
                const modulePaths = (target ? component[target][type] : component[type]) || [];
                for (const modulePath of modulePaths) {
                    if (typeof modulePath === 'string') {
                        let componentPath: string;
                        if (componentPackage.name === this.pkg.name) {
                            componentPath = paths.join(paths.resolve(this.projectPath), modulePath).split(paths.sep).join('/');
                        } else {
                            componentPath = paths.join(componentPackage.name, modulePath).split(paths.sep).join('/');
                        }
                        result.set(componentPackage.name, componentPath);
                        moduleIndex = moduleIndex + 1;
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
            const resolutionPaths = [this.packagePath || process.cwd()];
            this._moduleResolver = modulePath => require.resolve(modulePath, { paths: resolutionPaths });
        }
        return this._moduleResolver!;
    }

    resolveModulePath(moduleName: string, ...segments: string[]): string {
        return paths.resolve(this.resolveModule(moduleName + '/package.json'), '..', ...segments);
    }

}
