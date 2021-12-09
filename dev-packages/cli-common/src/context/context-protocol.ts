import { ApplicationPackage } from '../package';
import { program, Command } from '../command';
import { ComponentUtil, PathUtil, SpinnerUtil } from '../utils';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { ExpressionHandler } from '../el';
import { HookExecutor } from '../hook';
import { ApplicationConfig } from '../package';
import { Framework } from '@malagu/frameworks';
import { ExpressionContext } from '../el';
import { Settings } from '../settings/settings-protocol';
import { getPackager } from '../packager';

export interface CliContext {
    program: Command;
    pkg: ApplicationPackage;
    cfg: ApplicationConfig;
    framework?: Framework;
    settings?: Settings;
    output: Record<string, any>;
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
    framework?: Framework;
}

export namespace CliContext {

    async function installComponent(pkg: ApplicationPackage, component: string, version: string, dev = false) {
        try {
             pkg.resolveModule(component + '/package.json');
        } catch (error) {
            if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
                // NoOp
            }
            if (error.code === 'MODULE_NOT_FOUND') {
                const packager = getPackager();
                await SpinnerUtil.start(`Install ${component}@${version}`, async () => {
                    await packager.add([ `${component}@${version}` ], { exact: true, dev });
                });
            }
        }
    }

    async function installComponents(pkg: ApplicationPackage) {
        const components = pkg.rootComponentPackage.malaguComponent!.components;
        const devComponents = pkg.rootComponentPackage.malaguComponent!.devComponents;
        if (components) {
            for (const component in components) {
                if (Object.prototype.hasOwnProperty.call(components, component)) {
                    const version = components[component];
                    await installComponent(pkg, component, version);
                }
            }
        }

        if (devComponents) {
            for (const component in devComponents) {
                if (Object.prototype.hasOwnProperty.call(devComponents, component)) {
                    const version = devComponents[component];
                    await installComponent(pkg, component, version);
                }
            }
        }
    }

    export async function create(options: CreateCliContextOptions, projectPath: string = process.cwd(), skipComponent = false): Promise<CliContext> {
        // at this point, we will check the core package version in the *.lock file firstly
        if (!skipComponent) {
            ComponentUtil.checkPkgVersionConsistency(/^@malagu\/\w+/, projectPath);
        }

        let mode = options.mode || [];
        const targets = options.targets || [];
        const runtime = options.runtime;
        if (runtime) {
            projectPath = PathUtil.getRuntimePath(runtime);
        }
        const { framework } = options;
        if (framework) {
            mode.push(...framework.useMode);
            mode = Array.from(new Set<string>(mode));
        }
        const pkg = ApplicationPackage.create({ projectPath, runtime, mode, dev: options.dev, settings: options.settings });

        await installComponents(pkg);

        const cfg = new ApplicationConfig({ targets, program }, pkg);
        const handleExpression = (obj: any, ctx?: ExpressionContext) => {
            const expressionHandler = new ExpressionHandler();
            const jexlEngine = expressionHandler.expressionCompiler.jexlEngineProvider.provide();
            jexlEngine.addTransform('eval',  (text: string) => expressionHandler.evalSync(text, ctx || obj));
            expressionHandler.handle(obj, ctx || obj);
        };

        if (!skipComponent) {
            for (const target of [ FRONTEND_TARGET, BACKEND_TARGET ]) {
                const config = cfg.getConfig(target);
                config.env = { ...process.env, _ignoreEl: true };
                config.pkg = { ...pkg.pkg, _ignoreEl: true};
                config.currentRuntimePath = projectPath;
                config.cliContext = { ...options, ...program, _ignoreEl: true};
                const expressionHandler = new ExpressionHandler();

                const jexlEngine = expressionHandler.expressionCompiler.jexlEngineProvider.provide();
                jexlEngine.addTransform('eval',  (text: string) => expressionHandler.evalSync(text, config));

                await new HookExecutor().executeHooks({
                    pkg,
                    cfg,
                    program,
                    target,
                    props: config,
                    expressionHandler,
                    output: {},
                    ...options
                }, 'propsHooks');

                expressionHandler.handle(config);
                delete config.env;
                delete config.pkg;
                delete config.cliContext;
                delete config.currentRuntimePath;
            }

        }
        if (framework) {
            handleExpression(framework, {
                backend: cfg.getConfig(BACKEND_TARGET),
                frontend: cfg.getConfig(FRONTEND_TARGET),
                ...cfg.getConfig(BACKEND_TARGET)
            });
            for (const key of Object.keys(framework.settings.env || {})) {
                process.env[key] = framework.settings.env[key];
            }
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

    export function createInitContext(cliContext: CliContext): Promise<InitContext> {
        return Promise.resolve(cliContext);
    }

    export async function createConfigContext(cliContext: CliContext): Promise<ConfigContext> {
        return cliContext;
    }

    export async function createInfoContext(cliContext: CliContext): Promise<ConfigContext> {
        return cliContext;
    }

    export async function createDeployContext(cliContext: CliContext): Promise<DeployContext> {
        return cliContext;
    }

    export async function createBuildContext(cliContext: CliContext): Promise<BuildContext> {
        return cliContext;
    }

    export async function createPropsContext(
        cliContext: CliContext, target: string, props: { [key: string]: any }, expressionHandler: ExpressionHandler): Promise<PropsContext> {
        return { ...cliContext, target, props, expressionHandler };
    }

}

export interface InitContext extends CliContext {

}

export interface ConfigContext extends CliContext {

}

export interface InfoContext extends CliContext {

}

export interface PropsContext extends CliContext {
    props: { [key: string]: any };
    target: string;
    expressionHandler: ExpressionHandler;
}

export interface BuildContext extends CliContext {

}

export interface DeployContext extends CliContext {

}
