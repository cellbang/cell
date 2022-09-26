import { ApplicationPackage } from '../package/application-package';
import { program, Command } from '../command/command-protocol';
import { ComponentUtil } from '../utils/component-util';
import { PathUtil } from '../utils/path-util';
import { RuntimeUtil } from '../utils/runtime-util';
import { SpinnerUtil } from '../utils/spinner-util';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { ExpressionHandler } from '../el/expression-handler';
import { HookExecutor, HookStage } from '../hook/hook-executor';
import { ApplicationConfig } from '../package/application-config';
import { Framework } from '@malagu/frameworks/lib/detector/detector-protocol';
import { Settings } from '../settings/settings-protocol';
import { getPackager } from '../packager/utils';
import * as ora from 'ora';
import { ExpressionHandlerFactory } from '../el';
const chalk = require('chalk');

export interface CliContext {
    program: Command;
    pkg: ApplicationPackage;
    cfg: ApplicationConfig;
    framework?: Framework;
    settings?: Settings;
    output: Record<string, any>;
    options?: Record<string, any>;
    propsDir?: string;
    propsFile?: string;
    [key: string]: any;
}

export interface CreateCliContextOptions extends Record<string, any> {
    args: string[];
    targets: string[];
    mode: string[];
    prod: boolean;
    settings?: Settings;
    dev: boolean;
    runtime?: string;
    port?: string;
    options?: Record<string, any>;
    propsDir?: string;
    propsFile?: string;
    framework?: Framework;
    skipAutoInstall?: boolean;
}

export namespace CliContext {

    async function installComponent(pkg: ApplicationPackage, component: string, version: string, spinner?: ora.Ora, dev = false) {
        try {
             pkg.resolveModule(component + '/package.json');
        } catch (error) {
            if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
                // NoOp
            }
            if (error.code === 'MODULE_NOT_FOUND') {
                spinner?.stop();
                const packager = getPackager(undefined, PathUtil.getRuntimePath(pkg.runtime));
                await SpinnerUtil.start({ text: chalk`Installing {bold ${component}@${version}} in {yellow.bold ${pkg.runtime}} runtime...`}, async () => {
                    await packager.add([ `${component}@${version}` ], { exact: true, dev, stdio: 'pipe' }, PathUtil.getRuntimePath(pkg.runtime));
                }, chalk`Installed {bold ${component}@${version}} in {yellow.bold ${pkg.runtime}} runtime`);
            }
        }
    }

    async function installComponents(pkg: ApplicationPackage, spinner?: ora.Ora) {
        const components = pkg.rootComponentPackage.malaguComponent!.components;
        const devComponents = pkg.rootComponentPackage.malaguComponent!.devComponents;
        if (components) {
            for (const component in components) {
                if (Object.prototype.hasOwnProperty.call(components, component)) {
                    let version = components[component];
                    if (version?.includes('$')) {
                        version = version.replace('${version}', RuntimeUtil.getVersion());
                        components[component] = version;
                    }
                    await installComponent(pkg, component, version, spinner);
                }
            }
        }

        if (devComponents) {
            for (const component in devComponents) {
                if (Object.prototype.hasOwnProperty.call(devComponents, component)) {
                    let version = devComponents[component];
                    if (version?.includes('$')) {
                        version = version.replace('${version}', RuntimeUtil.getVersion());
                        devComponents[component] = version;
                    }
                    await installComponent(pkg, component, version, spinner, true);
                }
            }
        }
    }

    async function renderConfig(pkg: ApplicationPackage, cfg: ApplicationConfig, options: CreateCliContextOptions, otherConfig: any) {
        for (const target of [ FRONTEND_TARGET, BACKEND_TARGET ]) {
            const config = cfg.getConfig(target);
            const envForConfig = config.env || {};
            config.env = { ...otherConfig.env, ...envForConfig };
            config.pkg = otherConfig.pkg;
            config.currentRuntimePath = otherConfig.currentRuntimePath;
            config.frontendProjectDistPath = otherConfig.frontendProjectDistPath;
            config.backendProjectDistPath = otherConfig.backendProjectDistPath;
            config.projectDir = process.cwd();
            config.cliContext = otherConfig.cliContext;
            config.currentTarget = target;
            const expressionHandler = new ExpressionHandlerFactory().create(config);

            const ctx = {
                pkg,
                cfg,
                program,
                target,
                props: config,
                expressionHandler,
                output: {},
                ...options
            };

            await new HookExecutor().executeHooks(ctx, 'propsHooks', HookStage.before);

            expressionHandler.handle(config);

            delete config.pkg;
            delete config.cliContext;
            delete config.projectDir;
            delete config.currentRuntimePath;
            delete config.frontendProjectDistPath;
            delete config.backendProjectDistPath;

            for (const key of Object.keys(config.env)) {
                if (key in envForConfig) {
                    process.env[key] = expressionHandler.handle(config.env[key], config);
                } else {
                    delete config.env[key];
                }
            }

            await new HookExecutor().executeHooks(ctx, 'propsHooks');
            await new HookExecutor().executeHooks(ctx, 'propsHooks', HookStage.after);

        }
    }

    export async function create(options: CreateCliContextOptions, projectPath: string = process.cwd(), skipComponent = false): Promise<CliContext> {
        // at this point, we will check the core package version in the *.lock file firstly
        if (!skipComponent) {
            try {
                ComponentUtil.checkPkgVersionConsistency(/^@malagu\/\w+/, projectPath);
            } catch (error) {
                // NoOp
            }
        }

        let mode = options.mode || [];
        const targets = options.targets || [];
        const runtime = options.runtime;
        if (runtime) {
            projectPath = PathUtil.getRuntimePath(runtime);
        }
        const { framework, settings } = options;
        if (settings?.defaultMode?.length) {
            mode.push(...settings.defaultMode);
        }
        if (framework) {
            mode.push(...framework.useMode);
        }
        mode = Array.from(new Set<string>(mode));
        const pkg = ApplicationPackage.create({
            projectPath, runtime, mode, dev: options.dev, propsDir: options.propsDir, propsFile: options.propsFile, settings: options.settings, framework
        });

        if (options.skipAutoInstall !== true) {
            await installComponents(pkg, options.spinner);
        }

        const cfg = new ApplicationConfig({ targets, program }, pkg);

        const otherConfig = {
            env: { ...process.env, _ignoreEl: true },
            pkg: { ...pkg.pkg, _ignoreEl: true },
            currentRuntimePath: projectPath,
            frontendProjectDistPath: PathUtil.getFrontendProjectDistPath(),
            backendProjectDistPath: PathUtil.getBackendProjectDistPath(),
            cliContext: { ...options, ...program, _ignoreEl: true},
        };

        if (!skipComponent) {
            await renderConfig(pkg, cfg, options, otherConfig);
        }

        return <CliContext> {
            ...options,
            framework,
            pkg,
            cfg,
            dest: 'dist',
            program,
            output: {}
        };
    }
}

let _current: CliContext;

export namespace ContextUtils {

    export function getCurrent() {
        return _current;
    }

    export function setCurrent(current: CliContext) {
        _current = current;
    }

    export function createCliContext(options: CreateCliContextOptions, projectPath?: string): Promise<CliContext> {
        return CliContext.create(options, projectPath);
    }

    export function mergeContext(cliContext: CliContext, options: Record<string, any> = {}) {
        for (const key of Object.keys(options)) {
            cliContext[key] = options[key];
        }
        return cliContext;
    }

}

export interface InitContext extends CliContext {

}

export interface ConfigContext extends CliContext {

}

export interface InfoContext extends CliContext {

}

export interface ServeContext extends CliContext {
    dev?: boolean;
    port?: string;
}

export interface PropsContext extends CliContext {
    props: { [key: string]: any };
    target: string;
    expressionHandler: ExpressionHandler;
}

export interface CompileContext extends CliContext {

}

export interface BuildContext extends CliContext {

}

export interface DeployContext extends CliContext {

}
