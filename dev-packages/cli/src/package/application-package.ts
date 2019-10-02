import * as paths from 'path';
import { readJsonFile } from './json-file';
import { NodePackage, PublishedNodePackage, sortByKey } from './npm-registry';
import { Component, ComponentPackage } from './component-package';
import { ComponentPackageCollector } from './component-package-collector';
import { ApplicationProps } from './application-props';
import { existsSync, readFileSync } from 'fs-extra';
import mergeWith = require('lodash.mergewith');
import yaml = require('js-yaml');
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
const chalk = require('chalk');

// tslint:disable:no-implicit-dependencies

// tslint:disable-next-line:no-any
export type ApplicationLog = (message?: any, ...optionalParams: any[]) => void;
export class ApplicationPackageOptions {
    readonly projectPath: string;
    readonly log?: ApplicationLog;
    readonly error?: ApplicationLog;
}

export type ApplicationModuleResolver = (modulePath: string) => string;

export function customizer(objValue: any, srcValue: any) {
    if (Array.isArray(objValue)) {
      return srcValue;
    }
  }

export class ApplicationPackage {
    readonly projectPath: string;
    readonly log: ApplicationLog;
    readonly error: ApplicationLog;

    constructor(
        protected readonly options: ApplicationPackageOptions
    ) {
        this.projectPath = options.projectPath;
        this.log = options.log || console.log.bind(console);
        this.error = options.error || console.error.bind(console);
    }

    protected _props: ApplicationProps | undefined;
    get props(): ApplicationProps {
        if (this._props) {
            return this._props;
        }
        let props = mergeWith({}, ApplicationProps.DEFAULT, customizer);
        for (const componentPackage of this.componentPackages) {
            const component = componentPackage.malaguComponent;
            if (component) {
                const { config } = component;
                if (config) {
                    props = mergeWith(props, config, customizer);
                }
            }
        }

        const appConfigPath = this.path('app.yml');
        if (existsSync(appConfigPath)) {
            const appConfig = yaml.safeLoad(readFileSync(appConfigPath, { encoding: 'utf8' }));
            props = mergeWith(props, appConfig);
        }

        if (props.mode) {
            const appConfigPathForMode = this.path(`app-${props.mode}.yml`);
            if (existsSync(appConfigPathForMode)) {
                const appConfigForMode = yaml.safeLoad(readFileSync(appConfigPathForMode, { encoding: 'utf8' }));
                props = mergeWith(props, appConfigForMode);
            }
        }

        return props;
    }

    protected _frontendConfig: ApplicationProps | undefined;
    get frontendConfig(): ApplicationProps {
        if (this._frontendConfig) {
            return this._frontendConfig;
        }
        const config = { ...this.props };
        delete config.backend;
        delete config.frontend;
        return mergeWith(config, this.props.frontend, customizer);
    }

    protected _backendConfig: ApplicationProps | undefined;
    get backendConfig(): ApplicationProps {
        if (this._frontendConfig) {
            return this._frontendConfig;
        }
        const config = { ...this.props };
        delete config.backend;
        delete config.frontend;
        return mergeWith(config, this.props.backend, customizer);
    }

    protected _pkg: NodePackage | undefined;
    get pkg(): NodePackage {
        if (this._pkg) {
            return this._pkg;
        }
        return this._pkg = readJsonFile(this.packagePath);
    }

    protected _frontendModules: Map<string, string> | undefined;
    protected _backendModules: Map<string, string> | undefined;
    protected _initHookModules: Map<string, string> | undefined;
    protected _serveHookModules: Map<string, string> | undefined;
    protected _deployHookModules: Map<string, string> | undefined;
    protected _componentPackages: ComponentPackage[] | undefined;
    protected _webpackHookModules: Map<string, string> | undefined;

    /**
     * Component packages in the topological order.
     */
    get componentPackages(): ReadonlyArray<ComponentPackage> {
        if (!this._componentPackages) {
            const collector = new ComponentPackageCollector(
                raw => this.newComponentPackage(raw),
                this.resolveModule
            );
            this._componentPackages = collector.collect(this.pkg);
            for (const componentPackage of this._componentPackages) {
                console.log(chalk`malagu {green component} - ${ componentPackage.name }@${ componentPackage.version }`);
                const malaguComponent = <Component>componentPackage.malaguComponent;
                if (!malaguComponent.config || malaguComponent.config && malaguComponent.config.auto !== false) {
                    this.addModuleIfExists(componentPackage.name, malaguComponent, true);
                }
                this.parseEntry(componentPackage.name, malaguComponent, true);
            }
            if (!(this.pkg.private === true && this.pkg.workspaces)) {
                const malaguComponent = { ...this.pkg.malaguComponent };
                const name = this.pkg.name || paths.basename(this.projectPath);
                this.addModuleIfExists(name, malaguComponent, false);
                this.parseEntry(name, malaguComponent, false);
                this.pkg.malaguComponent = malaguComponent;
                this._componentPackages.push(<ComponentPackage>this.pkg);
            }

            for (const componentPackage of this._componentPackages) {
                const malaguComponent = <Component>componentPackage.malaguComponent;
                for (const modulePath of [...malaguComponent.frontends || [], ...malaguComponent.backends || []]) {
                    console.log(chalk`malagu {cyan module} - ${componentPackage.name}/${ modulePath }`);
                }
            }
        }

        return this._componentPackages;
    }

    protected parseEntry(name: string, component: Component, isModule: boolean) {
        const config = component.config;
        if (config) {
            const prefix = isModule ? name : '.';
            if (config.frontend && config.frontend.entry) {
                if (typeof config.frontend.entry === 'string') {
                    config.frontend.entry = `${prefix}/${config.frontend.entry}`;
                } else {
                    for (const key in config.frontend.entry) {
                        if (config.frontend.entry.hasOwnProperty(key)) {
                            config.frontend.entry[key] = `${prefix}/${config.frontend.entry[key]}`;
                        }
                    }
                }
            }
            if (config.backend && config.backend.entry) {
                if (typeof config.backend.entry === 'string') {
                    config.backend.entry = `${prefix}/${config.backend.entry}`;
                } else {
                    for (const key in config.backend.entry) {
                        if (config.backend.entry.hasOwnProperty(key)) {
                            config.backend.entry[key] = `${prefix}/${config.backend.entry[key]}`;
                        }
                    }
                }
            }
        }

    }

    protected doAddModuleIfExists(modulePaths: string[], fullModulePath: string, modulePath: string): void {
        try {
            this.resolveModule(fullModulePath);
            if (modulePaths.indexOf(modulePath) === -1) {
                modulePaths.push(modulePath);
            }
        } catch (error) {
            // noop
        }
    }

    protected addModuleIfExists(name: string, component: Component, isModule: boolean): void {
        component.frontends = component.frontends || [];
        component.backends = component.backends || [];
        const prefix = isModule ? name : '.';
        const frontendModulePath = paths.join('lib', 'browser', `${FRONTEND_TARGET}-module`);
        const backendModulePath = paths.join('lib', 'node', `${BACKEND_TARGET}-module`);
        const fullFrontendModulePath = `${prefix}/${frontendModulePath}`;
        const fullBackendModulePath = `${prefix}/${backendModulePath}`;
        this.doAddModuleIfExists(component.frontends, fullFrontendModulePath, frontendModulePath);
        this.doAddModuleIfExists(component.backends, fullBackendModulePath, backendModulePath);
    }

    getComponentPackage(component: string): ComponentPackage | undefined {
        return this.componentPackages.find(pkg => pkg.name === component);
    }

    async findComponentPackage(component: string): Promise<ComponentPackage | undefined> {
        return this.getComponentPackage(component);
    }

    protected newComponentPackage(raw: PublishedNodePackage): ComponentPackage {
        return new ComponentPackage(raw);
    }

    get frontendModules(): Map<string, string> {
        if (!this._frontendModules) {
            this._frontendModules = this.computeModules('frontends');
        }
        return this._frontendModules;
    }

    get backendModules(): Map<string, string> {
        if (!this._backendModules) {
            this._backendModules = this.computeModules('backends');
        }
        return this._backendModules;
    }

    get initHookModules() {
        if (!this._initHookModules) {
            this._initHookModules = this.computeModules('initHooks');
        }
        return this._initHookModules;
    }

    get serveHookModules() {
        if (!this._initHookModules) {
            this._initHookModules = this.computeModules('serveHooks');
        }
        return this._initHookModules;
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

    computeModules(tagret: string): Map<string, string> {
        const result = new Map<string, string>();
        let moduleIndex = 1;
        for (const componentPackage of this.componentPackages) {
            const component = componentPackage.malaguComponent;
            if (component) {
                const modulePaths = <string[]>(component as any)[tagret] || [];
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
