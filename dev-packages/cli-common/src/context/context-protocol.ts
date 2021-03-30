import { ApplicationPackage } from '../package';
import { CommanderStatic } from 'commander';
import { checkPkgVersionConsistency } from '../util';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { HookExecutor } from '../hook';
import { ExpressionHandler } from '../el';
import { ApplicationConfig } from '../package/application-config';

export interface CliContext {
    program: CommanderStatic;
    pkg: ApplicationPackage;
    cfg: ApplicationConfig;
    [key: string]: any;
}

export namespace CliContext {
    export async function create(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd(), skipComponent = false): Promise<CliContext> {
        // at this point, we will check the core package version in the *.lock file firstly
        if (!skipComponent) {
            checkPkgVersionConsistency('@malagu/core', projectPath);
        }

        const mode = options.mode || [];
        const targets = options.targets || [];
        const pkg = ApplicationPackage.create({ projectPath, mode });
        const cfg = new ApplicationConfig({ targets, program }, pkg);

        if (!skipComponent) {
            for (const target of [ FRONTEND_TARGET, BACKEND_TARGET ]) {
                const config = cfg.getConfig(target);
                const hookExecutor = new HookExecutor();
                await hookExecutor.executeConfigHooks({
                    pkg,
                    cfg,
                    program,
                    config: config,
                    ...options
                });

                config.env = { ...process.env, _ignoreEl: true };

                config.pkg = { ...pkg.pkg, _ignoreEl: true};
                config.cliContext = { ...options, ...program, _ignoreEl: true};
                new ExpressionHandler(config).handle();
                delete config.env;
                delete config.pkg;
                delete config.cliContext;
            }

        }

        return <CliContext> {
            ...options,
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

    export function createCliContext(program: CommanderStatic, options: { [key: string]: any } = {}, projectPath: string = process.cwd()): Promise<CliContext> {
        return CliContext.create(program, options, projectPath);
    }

    export function createInitContext(cliContext: CliContext): Promise<InitContext> {
        return Promise.resolve(cliContext);
    }

    export async function createConfigContext(cliContext: CliContext, config: { [key: string]: any }): Promise<ConfigContext> {
        return { ...cliContext, config };
    }

}

export interface InitContext extends CliContext {

}

export interface ConfigContext extends CliContext {
    config: { [key: string]: any };
}
