
import * as webpack from 'webpack';
import { BACKEND_TARGET, spawnProcess, HookExecutor, BuildContext } from '@malagu/cli-common';
import { packExternalModules } from '../external';
import { ServiceContextUtils } from '../context';

export class BuildManager {

    constructor(protected readonly ctx: BuildContext) {

    }

    async build(): Promise<void> {
        const buildCommand: string = this.ctx.framework?.settings.buildCommand;
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
