import { ApplicationPackage } from './application-package';
import { ComponentPackage } from './package-protocol';
import { ModulePathBuilder } from './module-path-builder';
import { join } from 'path';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { ModuleChecker } from './module-checker';

export class ModuleResolver {
    protected readonly modulePathBuilder = new ModulePathBuilder(this.pkg);
    protected readonly moduleChecker = new ModuleChecker(this.pkg);

    constructor(protected readonly pkg: ApplicationPackage) {

    }

    resolve(componentPackage: ComponentPackage): void {
        this.resolveComponentModule(componentPackage);
        this.resolveHookModule(componentPackage);
        this.resolveAssetModule(componentPackage);
    }

    protected addModuleIfExists(componentPackage: ComponentPackage, modulePaths: string[], modulePath: string): void {
        if (this.moduleChecker.check(this.modulePathBuilder.build(componentPackage, modulePath))) {
            if (modulePaths.indexOf(modulePath) === -1) {
                modulePaths.push(modulePath);
            }
        }
    }

    resolveComponentModule(componentPackage: ComponentPackage): void {
        const malaguComponent = componentPackage.malaguComponent!;
        malaguComponent.frontend = malaguComponent.frontend || [];
        malaguComponent.backend = malaguComponent.backend || [];

        malaguComponent.frontend.modules = [ ...malaguComponent.modules || [],  ...malaguComponent.frontend.modules || [] ];
        malaguComponent.backend.modules = [ ...malaguComponent.modules || [],  ...malaguComponent.backend.modules || [] ];
        const frontendModules = malaguComponent.frontend.modules;
        const backendModules = malaguComponent.backend.modules;
        const libOrSrc = this.pkg.isRoot(componentPackage) ? 'src' : 'lib';

        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, 'browser', `${FRONTEND_TARGET}-module`));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, 'node', `${BACKEND_TARGET}-module`));
        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, 'browser', 'module'));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, 'node', 'module'));
        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, 'module'));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, 'module'));
        this.addModuleIfExists(componentPackage, frontendModules, join(libOrSrc, `${FRONTEND_TARGET}-module`));
        this.addModuleIfExists(componentPackage, backendModules, join(libOrSrc, `${BACKEND_TARGET}-module`));
    }

    resolveHookModule(componentPackage: ComponentPackage): void {
        const malaguComponent = componentPackage.malaguComponent!;

        malaguComponent.webpackHooks = malaguComponent.webpackHooks || [];
        malaguComponent.initHooks = malaguComponent.initHooks || [];
        malaguComponent.configHooks = malaguComponent.configHooks || [];
        malaguComponent.buildHooks = malaguComponent.buildHooks || [];
        malaguComponent.deployHooks = malaguComponent.deployHooks || [];
        malaguComponent.serveHooks = malaguComponent.serveHooks || [];
        malaguComponent.webpackHooks = malaguComponent.webpackHooks || [];
        const webpackHooks = malaguComponent.webpackHooks;
        const initHooks = malaguComponent.initHooks;
        const configHooks = malaguComponent.configHooks;
        const buildHooks = malaguComponent.buildHooks;
        const deployHooks = malaguComponent.deployHooks;
        const serveHooks = malaguComponent.serveHooks;

        const libOrSrc = this.pkg.isRoot(componentPackage) ? 'src' : 'lib';

        this.addModuleIfExists(componentPackage, webpackHooks, join(libOrSrc, 'hooks', 'webpack'));
        this.addModuleIfExists(componentPackage, webpackHooks, join(libOrSrc, 'webpack-hook'));
        this.addModuleIfExists(componentPackage, initHooks, join(libOrSrc, 'hooks', 'init'));
        this.addModuleIfExists(componentPackage, initHooks, join(libOrSrc, 'init-hook'));
        this.addModuleIfExists(componentPackage, configHooks, join(libOrSrc, 'hooks', 'config'));
        this.addModuleIfExists(componentPackage, configHooks, join(libOrSrc, 'config-hook'));
        this.addModuleIfExists(componentPackage, buildHooks, join(libOrSrc, 'hooks', 'build'));
        this.addModuleIfExists(componentPackage, buildHooks, join(libOrSrc, 'build-hook'));
        this.addModuleIfExists(componentPackage, deployHooks, join(libOrSrc, 'hooks', 'deploy'));
        this.addModuleIfExists(componentPackage, deployHooks, join(libOrSrc, 'deploy-hook'));
        this.addModuleIfExists(componentPackage, serveHooks, join(libOrSrc, 'hooks', 'serve'));
        this.addModuleIfExists(componentPackage, serveHooks, join(libOrSrc, 'serve-hook'));

    }

    resolveAssetModule(componentPackage: ComponentPackage): void {
        const malaguComponent = componentPackage.malaguComponent!;

        malaguComponent.frontend.assets = [ ...malaguComponent.assets || [],  ...malaguComponent.frontend.assets || [] ];
        malaguComponent.backend.assets = [ ...malaguComponent.assets || [],  ...malaguComponent.backend.assets || [] ];
        const frontendAssets = malaguComponent.frontend.assets;
        const backendAssets = malaguComponent.backend.assets;

        this.addModuleIfExists(componentPackage, frontendAssets, join('src', 'assets'));
        this.addModuleIfExists(componentPackage, backendAssets, join('src', 'assets'));
        this.addModuleIfExists(componentPackage, frontendAssets, 'assets');
        this.addModuleIfExists(componentPackage, backendAssets, 'assets');
        this.addModuleIfExists(componentPackage, frontendAssets, join('browser', 'assets'));
        this.addModuleIfExists(componentPackage, backendAssets, join('node', 'assets'));

    }

}
