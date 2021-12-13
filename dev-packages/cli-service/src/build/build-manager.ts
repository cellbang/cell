
import * as webpack from 'webpack';
import { BACKEND_TARGET, spawnProcess, HookExecutor, BuildContext, PathUtil, LoggerUtil } from '@malagu/cli-common';
import { packExternalModules } from '../external';
import { ServiceContextUtils } from '../context';
import { readdirSync, statSync, existsSync } from 'fs-extra';
import { join } from 'path';
const rimraf = require('rimraf');

export class BuildManager {

    constructor(protected readonly ctx: BuildContext) {

    }

    protected cleanDistDir() {
        const { runtime } = this.ctx;
        rimraf.sync(PathUtil.getProjectDistPath(runtime));
        PathUtil.getProjectDistPath(runtime);
        const distParentPath = PathUtil.getProjectDistParentPath(runtime);
        if (runtime && existsSync(distParentPath)) {
            try {
                const targets = readdirSync(distParentPath);
                if (targets.length >= 5) {
                    for (const target of targets) {
                        const stats = statSync(join(distParentPath, target));
                        if (stats.isDirectory() && Date.now() - stats.ctimeMs > 24 * 60 * 60 * 1000) {
                            rimraf.sync(join(distParentPath, target));
                        }
                    }
                }
            } catch (error) {
                // NoOp
            }
        }
    }

    protected log() {
        LoggerUtil.printStage(this.ctx);
        LoggerUtil.printMode(this.ctx);
        LoggerUtil.printTargets(this.ctx);
        LoggerUtil.printComponents(this.ctx);
    }

    async build(): Promise<void> {
        this.log();
        this.cleanDistDir();

        const compileCommand: string = this.ctx.framework?.settings?.compileCommand;
        if (compileCommand) {
            const args = compileCommand.split(/\s+/);
            await spawnProcess(args.shift()!, args, { stdio: 'inherit' });
        }

        const buildCommand: string = this.ctx.framework?.settings?.buildCommand;
        if (buildCommand) {
            const args = buildCommand.split(/\s+/);
            await spawnProcess(args.shift()!, args, { stdio: 'inherit' });
        }

        const context = await ServiceContextUtils.createConfigurationContext(this.ctx);

        for (const configuration of context.configurations) {
            const compiler = webpack(configuration.toConfig());
            await new Promise<void>((resolve, reject) => compiler.run((err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (configuration.get('name') === BACKEND_TARGET) {
                    packExternalModules(context, stats).then(resolve).catch(reject);
                } else {
                    resolve();
                }
            }));
        }

        const hookExecutor = new HookExecutor();
        await hookExecutor.executeBuildHooks(this.ctx);
    }

}
