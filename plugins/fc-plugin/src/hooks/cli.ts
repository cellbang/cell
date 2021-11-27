import { CliContext } from '@malagu/cli-common';
import info from './info';

export default async (context: CliContext) => {
    const { program } = context;
    program
        .command('info')
        .description('display information about application')
        .action(() => {
           info(context);
        });
};
