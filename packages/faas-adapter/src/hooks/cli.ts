import { CliContext } from '@malagu/cli';
import { FaaSAdapterConfiguration } from './faas-protocol';
import { FaaSAdapterUtils } from './utils';

export default async (context: CliContext) => {
    const { program, cfg } = context;
    program
        .command('config')
        .description('config faas adapter profile')
        .action(() => {
            const { regions, profilePath } = FaaSAdapterUtils.getConfiguration<FaaSAdapterConfiguration>(cfg);
            FaaSAdapterUtils.promptForProfile(profilePath, regions);
        });
};
