import { ApplicationPackage } from '../package';
import { Command } from 'commander';
import { checkPkgVersionConsistency, getRuntimePath } from '../util';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { ExpressionHandler } from '../el';
import { HookExecutor } from '../hook';
import { ApplicationConfig } from '../package';
import { Framework } from '@malagu/frameworks';
import { ExpressionContext } from '../el';

export interface CliContext {
    program: Command;
    pkg: ApplicationPackage;
    cfg: ApplicationConfig;
    framework?: Framework;
    [key: string]: any;
}

export namespace CliContext {
    export async function create(
        program: Command, options: { [key: string]: any } = {}, projectPath: string = process.cwd(), skipComponent = false): Promise<CliContext> {
        // at this point, we will check the core package version in the *.lock file firstly
        if (!skipComponent) {
            checkPkgVersionConsistency(/^@malagu\/\w+/, projectPath);
        }

        let mode = options.mode || [];
        const targets = options.targets || [];
        const runtime = options.runtime;
        if (runtime) {
            projectPath = getRuntimePath(runtime);
        }
        const { framework } = options;
        if (framework) {
            mode.push(...framework.useMode);
            mode = Array.from(new Set<string>(mode));
        }
        const pkg = ApplicationPackage.create({ projectPath, runtime, mode });
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
                    config: config,
                    expressionHandler,
                    ...options
                }, 'configHooks');

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
            program
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

    export function createCliContext(
        program: Command, options: { [key: string]: any } = {}, projectPath?: string): Promise<CliContext> {
        return CliContext.create(program, options, projectPath);
    }

    export function createInitContext(cliContext: CliContext): Promise<InitContext> {
        return Promise.resolve(cliContext);
    }

    export async function createConfigContext(
        cliContext: CliContext, target: string, config: { [key: string]: any }, expressionHandler: ExpressionHandler): Promise<ConfigContext> {
        return { ...cliContext, target, config, expressionHandler };
    }

}

export interface InitContext extends CliContext {

}

export interface ConfigContext extends CliContext {
    config: { [key: string]: any };
    target: string;
    expressionHandler: ExpressionHandler;
}
