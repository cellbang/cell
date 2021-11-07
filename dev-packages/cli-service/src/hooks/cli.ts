import { CliContext } from '@malagu/cli-common';
import build from '../build/build';
import serve from '../serve/serve';
import deploy from '../deploy/deploy';

export default async (context: CliContext) => {
    const { program } = context;
    program
        .command('serve [entry]')
        .option('-o, --open [open]', 'Open browser')
        .option('-p, --port [port]', 'Port used by the server')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [])
        .description('serve a applicaton')
        .action((entry, options) => {
            serve(context, { entry, ...options });
        });

    program
        .command('build [entry]')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
        .option('-p, --prod [prod]', 'Create a production build')
        .description('build a application')
        .action((entry, options) => {
            build(context, { entry, ...options });
        });

    program
        .command('deploy [entry]')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
        .option('-p, --prod [prod]', 'Create a production deployment')
        .option('-s, --skip-build [skipBuild]', 'Skip the build process')
        .description('deploy a applicaton')
        .action((entry, options) => {
            deploy(context, { entry, ...options });
        });
};
