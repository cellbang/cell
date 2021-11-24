
import * as webpack from 'webpack';
import { BuildContext } from '../context';
import { BACKEND_TARGET, spawnProcess } from '@malagu/cli-common';
import { packExternalModules } from '../external';
import { HookExecutor } from '../hooks';

export class BuildManager {

    constructor(protected readonly ctx: BuildContext) {

    }

    async build(): Promise<void> {
        if (this.ctx.configurations.length === 0) {
            throw new Error('No malagu module found.');
        }

        const buildCommand: string = this.ctx.framework?.settings.buildCommand;
        if (buildCommand) {
            const args = buildCommand.split(/\s+/);
            await spawnProcess(args.shift()!, args, { stdio: 'inherit' });
        }

        for (const configuration of this.ctx.configurations) {
            const compiler = webpack(configuration.toConfig());
            await new Promise<void>((resolve, reject) => compiler.run((err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (configuration.get('name') === BACKEND_TARGET) {
                    packExternalModules(this.ctx, stats).then(resolve).catch(reject);
                } else {
                    resolve();
                }
            }));
        }

        const hookExecutor = new HookExecutor();
        await hookExecutor.executeBuildHooks(this.ctx);
    }

}
