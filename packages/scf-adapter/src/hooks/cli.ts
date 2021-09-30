import { CliContext } from '@malagu/cli-service';
import info from './info';

export default async (context: CliContext) => {
    const { program } = context;
    program
        .command('info')
        .description('display information about the service, temporarily only supports tencent-scf')
        .action(() => {
           info(context);
        });
};
