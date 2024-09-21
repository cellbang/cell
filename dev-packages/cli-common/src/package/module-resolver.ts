import { ApplicationPackage } from './application-package';
import { ComponentPackage, Module } from './package-protocol';
import { ModuleBuilder } from './module-builder';
import { join } from 'path';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { ModuleChecker } from './module-checker';

export class ModuleResolver {
    protected readonly moduleBuilder = new ModuleBuilder(this.pkg);
    protected readonly moduleChecker = new ModuleChecker(this.pkg);

    constructor(protected readonly pkg: ApplicationPackage) {

    }

    resolve(componentPackage: ComponentPackage): void {
        this.resolveComponentStaticModule(componentPackage);
        this.resolveComponentDynamicModule(componentPackage);
        this.resolveHookModule(componentPackage);
        this.resolveAssetModule(componentPackage);
    }

    protected addModuleIfExists(componentPackage: ComponentPackage, modules: Module[], modulePath: string): void {
        try {
            const module = this.moduleBuilder.build(componentPackage, modulePath);
            if (!modules.some(m => m.name === module.name)) {
                modules.push(module);
            }
        } catch (error) {
            // NoOp
        }
    }

    protected addModule(componentPackage: ComponentPackage, modules: Module[], modulePaths: string[]): void {
        for (const modulePath of modulePaths) {
            const module = this.moduleBuilder.build(componentPackage, modulePath);
            if (!modules.some(m => m.name === module.name)) {
                modules.push(module);
            }
        }
    }

    resolveComponentModule(componentPackage: ComponentPackage, target: string, suffix?: string): void {
        const prop = `${target}s`;
        suffix = suffix || target;
        const cellComponent = componentPackage.cellComponent!;
        cellComponent.frontend = cellComponent.frontend || {};
        cellComponent.backend = cellComponent.backend || {};

        const rawFrontendModules = [ ...cellComponent[prop] || [],  ...cellComponent.frontend[prop] || [] ];
        const rawBackendModules  = [ ...cellComponent[prop] || [],  ...cellComponent.backend[prop] || [] ];
        const frontendModules: Module[] = cellComponent.frontend[prop] = [];
        const backendModules: Module[] = cellComponent.backend[prop] = [];
        const libOrSrc = this.pkg.isRoot(componentPackage) ? 'src' : 'lib';

        this.addModule(componentPackage, frontendModules, rawFrontendModules);
        this.addModule(componentPackage, backendModules, rawBackendModules);

        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, 'common', suffix));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, 'common', suffix));
        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, 'browser', `${FRONTEND_TARGET}-${suffix}`));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, 'node', `${BACKEND_TARGET}-${suffix}`));
        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, 'browser', suffix));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, 'node', suffix));
        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, suffix));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, suffix));
        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, `${FRONTEND_TARGET}-${suffix}`));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, `${BACKEND_TARGET}-${suffix}`));
    }

    resolveComponentStaticModule(componentPackage: ComponentPackage): void {
        this.resolveComponentModule(componentPackage, 'staticModule', 'static-module');
    }

    resolveComponentDynamicModule(componentPackage: ComponentPackage): void {
        this.resolveComponentModule(componentPackage, 'module');
    }

    resolveHookModule(componentPackage: ComponentPackage): void {
        const cellComponent = componentPackage.cellComponent!;

        const rawWebpackHooks = cellComponent.webpackHooks || [];
        const rawInitHooks = cellComponent.initHooks || [];
        const rawConfigHooks = cellComponent.configHooks || [];
        const rawCompileHooks = cellComponent.compileHooks || [];
        const rawBuildHooks = cellComponent.buildHooks || [];
        const rawDeployHooks = cellComponent.deployHooks || [];
        const rawServeHooks = cellComponent.serveHooks || [];
        const rawCliHooks = cellComponent.cliHooks || [];
        const rawPropsHooks = cellComponent.propsHooks || [];
        const rawInfoHooks = cellComponent.infoHooks || [];

        const webpackHooks: Module[] = cellComponent.webpackHooks = [];
        const initHooks: Module[] = cellComponent.initHooks = [];
        const configHooks: Module[] = cellComponent.configHooks = [];
        const compileHooks: Module[] = cellComponent.compileHooks = [];
        const buildHooks: Module[] = cellComponent.buildHooks = [];
        const deployHooks: Module[] = cellComponent.deployHooks = [];
        const serveHooks: Module[] = cellComponent.serveHooks = [];
        const cliHooks: Module[] = cellComponent.cliHooks = [];
        const propsHooks: Module[] = cellComponent.propsHooks = [];
        const infoHooks: Module[] = cellComponent.infoHooks = [];

        const libOrSrc = this.pkg.isRoot(componentPackage) ? 'src' : 'lib';

        this.addModule(componentPackage, webpackHooks, rawWebpackHooks);
        this.addModule(componentPackage, initHooks, rawInitHooks);
        this.addModule(componentPackage, configHooks, rawConfigHooks);
        this.addModule(componentPackage, compileHooks, rawCompileHooks);
        this.addModule(componentPackage, buildHooks, rawBuildHooks);
        this.addModule(componentPackage, deployHooks, rawDeployHooks);
        this.addModule(componentPackage, serveHooks, rawServeHooks);
        this.addModule(componentPackage, cliHooks, rawCliHooks);
        this.addModule(componentPackage, propsHooks, rawPropsHooks);
        this.addModule(componentPackage, infoHooks, rawInfoHooks);

        this.addModuleIfExists(componentPackage, webpackHooks, join(libOrSrc, 'hooks', 'webpack'));
        this.addModuleIfExists(componentPackage, webpackHooks, join(libOrSrc, 'webpack-hook'));
        this.addModuleIfExists(componentPackage, initHooks, join(libOrSrc, 'hooks', 'init'));
        this.addModuleIfExists(componentPackage, initHooks, join(libOrSrc, 'init-hook'));
        this.addModuleIfExists(componentPackage, configHooks, join(libOrSrc, 'hooks', 'config'));
        this.addModuleIfExists(componentPackage, configHooks, join(libOrSrc, 'config-hook'));
        this.addModuleIfExists(componentPackage, compileHooks, join(libOrSrc, 'hooks', 'compile'));
        this.addModuleIfExists(componentPackage, compileHooks, join(libOrSrc, 'compile-hook'));
        this.addModuleIfExists(componentPackage, buildHooks, join(libOrSrc, 'hooks', 'build'));
        this.addModuleIfExists(componentPackage, buildHooks, join(libOrSrc, 'build-hook'));
        this.addModuleIfExists(componentPackage, deployHooks, join(libOrSrc, 'hooks', 'deploy'));
        this.addModuleIfExists(componentPackage, deployHooks, join(libOrSrc, 'deploy-hook'));
        this.addModuleIfExists(componentPackage, serveHooks, join(libOrSrc, 'hooks', 'serve'));
        this.addModuleIfExists(componentPackage, serveHooks, join(libOrSrc, 'serve-hook'));
        this.addModuleIfExists(componentPackage, cliHooks, join(libOrSrc, 'hooks', 'cli'));
        this.addModuleIfExists(componentPackage, cliHooks, join(libOrSrc, 'cli-hook'));
        this.addModuleIfExists(componentPackage, propsHooks, join(libOrSrc, 'hooks', 'props'));
        this.addModuleIfExists(componentPackage, propsHooks, join(libOrSrc, 'props-hook'));
        this.addModuleIfExists(componentPackage, infoHooks, join(libOrSrc, 'hooks', 'info'));
        this.addModuleIfExists(componentPackage, infoHooks, join(libOrSrc, 'info-hook'));
    }

    resolveAssetModule(componentPackage: ComponentPackage): void {
        const cellComponent = componentPackage.cellComponent!;

        const rawFrontendAssets = [ ...cellComponent.assets || [],  ...cellComponent.frontend.assets || [] ];
        const rawBackendAssets = [ ...cellComponent.assets || [],  ...cellComponent.backend.assets || [] ];
        const frontendAssets: Module[] = cellComponent.frontend.assets = [];
        const backendAssets: Module[] = cellComponent.backend.assets = [];

        this.addModule(componentPackage, frontendAssets, rawFrontendAssets);
        this.addModule(componentPackage, backendAssets, rawBackendAssets);

        this.addModuleIfExists(componentPackage, frontendAssets, join('src', 'assets'));
        this.addModuleIfExists(componentPackage, backendAssets, join('src', 'assets'));
        this.addModuleIfExists(componentPackage, frontendAssets, 'assets');
        this.addModuleIfExists(componentPackage, backendAssets, 'assets');
        this.addModuleIfExists(componentPackage, frontendAssets, join('src', 'browser', 'assets'));
        this.addModuleIfExists(componentPackage, backendAssets, join('src', 'node', 'assets'));

    }

}
