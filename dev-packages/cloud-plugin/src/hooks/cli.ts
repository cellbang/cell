import { CliContext } from '@malagu/cli-common';
import { CloudUtils } from './utils';

export default async (context: CliContext) => {
    const { program, cfg } = context;
    program
        .command('config')
        .description('config cloud profile')
        .action(() => {
            const { regions, profilePath } = CloudUtils.getConfiguration(cfg);
            CloudUtils.promptForProfile(profilePath, regions);
        });
};
