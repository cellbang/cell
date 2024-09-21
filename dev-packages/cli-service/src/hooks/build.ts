import * as webpack from 'webpack';
import { BACKEND_TARGET } from '@celljs/cli-common/lib/constants';
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { packExternalModules } from '../external/pack-external-module';
import { ServiceContextUtils } from '../context/context-protocol';
import { CommandType, CommandUtil } from '@celljs/cli-common/lib/utils/command-util';

export default async (ctx: CliContext) => {

    const context = await ServiceContextUtils.createConfigurationContext(ctx);
    const configurations = context.configurations;
    context.configurations = [];
    for (const c of configurations) {
        if (!await CommandUtil.hasCommand(ctx, c.get('name'), CommandType.BuildCommand)) {
            context.configurations.push(c);
        }
    }
    for (const configuration of context.configurations) {
        const compiler = webpack(configuration.toConfig());
        await new Promise<void>((resolve, reject) => compiler.run((err, stats) => {
            if (err || stats?.hasErrors()) {
                reject(err || '');
                return;
            }
            if (configuration.get('name') === BACKEND_TARGET) {
                packExternalModules(context, stats).then(resolve).catch(reject);
            } else {
                resolve();
            }
        }));
    }

};
