import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { CommandUtil } from '@celljs/cli-common/lib/utils/command-util';
import { Argument } from '@celljs/cli-common/lib/command';

export default async (context: CliContext) => {

    const serveCommand = CommandUtil.getServeCommand(context);
    if (serveCommand) {
        serveCommand
            .addArgument(new Argument('[entry]'))
            .option('-o, --open [open]', 'open browser');
    }

    const buildCommand = CommandUtil.getBuildCommand(context);
    if (buildCommand) {
        buildCommand
            .addArgument(new Argument('[entry]'))
            .option('-p, --prod [prod]', 'create a production build');
    }

    const deployommand = CommandUtil.getDeployCommand(context);
    if (deployommand) {
        deployommand
            .addArgument(new Argument('[entry]'))
            .option('-p, --prod [prod]', 'create a production deployment')
            .option('-s, --skip-build [skipBuild]', 'skip the build process');
    }

};
