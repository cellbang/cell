import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import build from '../build/build';
import serve from '../serve/serve';
import deploy from '../deploy/deploy';

export default async (context: CliContext) => {
    const { program } = context;
    program
        .command('serve [entry]')
        .option('-o, --open [open]', 'open browser')
        .option('-p, --port [port]', 'port used by the server')
        .description('serve a applicaton')
        .action((entry, options) => {
            serve(context, { entry, ...options });
        });

    program
        .command('build [entry]')
        .option('-p, --prod [prod]', 'create a production build')
        .description('build a application')
        .action((entry, options) => {
            build(context, { entry, ...options });
        });

    program
        .command('deploy [entry]')
        .option('-p, --prod [prod]', 'create a production deployment')
        .option('-s, --skip-build [skipBuild]', 'skip the build process')
        .description('deploy a applicaton')
        .action((entry, options) => {
            deploy(context, { entry, ...options });
        });
};
