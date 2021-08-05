import { program, Command } from 'commander';

const leven = require('leven');
import * as ora from 'ora';
import { executeHook, getSettings } from '@malagu/cli-common';
import { loadCommand, loadContext } from './util';
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const version = pkg.version;
updateNotifier({ pkg }).notify();
const { defaultRuntime } = getSettings();

console.log(`
                   ___
 /'\\_/\`\\          /\\_ \\
/\\      \\     __  \\//\\ \\      __       __   __  __
\\ \\ \\__\\ \\  /'__\`\\  \\ \\ \\   /'__\`\\   /'_ \`\\/\\ \\/\\ \\
 \\ \\ \\_/\\ \\/\\ \\L\\.\\_ \\_\\ \\_/\\ \\L\\.\\_/\\ \\L\\ \\ \\ \\_\\ \\
  \\ \\_\\\\ \\_\\ \\__/.\\_\\/\\____\\ \\__/.\\_\\ \\____ \\ \\____/
   \\/_/ \\/_/\\/__/\\/_/\\/____/\\/__/\\/_/\\/___L\\ \\/___/
                                       /\\____/
${chalk.italic((('@malagu/cli@' + version) as any).padStart(37))}  \\_/__/

╭──────────────────────────────────────────────────╮
│      Serverless Frist Development Framework      │${defaultRuntime ? '\n│' + 
chalk.yellow(`Runtime<${defaultRuntime}>`.padStart(25 + Math.floor((9 + defaultRuntime.length)/2)).padEnd(50))+ '│' : ''}
╰──────────────────────────────────────────────────╯
`);

const spinner = ora({ text: chalk.italic.gray('loading command line context...\n'), discardStdin: false }).start();

(async () => {
    const context = await loadContext(program, spinner);
    const { componentPackages, configHookModules, webpackHookModules, serveHookModules, buildHookModules, deployHookModules } = context.pkg;

    if (context.args.includes('serve') || context.args.includes('build')) {
        process.send!({
            type: 'cliContext',
            data: {
                components: componentPackages.map(c => c.malaguComponent),
                configHookModules: configHookModules,
                webpackHookModules: webpackHookModules,
                serveHookModules: serveHookModules,
                buildHookModules: buildHookModules,
                deployHookModules: deployHookModules
            }
        });
    }
    program
        .version(version, '-v, --version', 'version for malagu')
        .usage('<command> [options]');

    program
        .command('init [name] [template]')
        .option('-o, --output-dir [path]', 'output directory', '.')
        .description('init a application')
        .action((name, template, options) => {
            require('./init/init').default({ name, template, outputDir: '.', ...options });
        });

    program
        .command('serve [entry]')
        .option('-o, --open [open]', 'Open browser')
        .option('-p, --port [port]', 'Port used by the server')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [])
        .description('serve a applicaton')
        .action((entry, options) => {
            loadCommand(context, 'serve', '@malagu/cli-service').default(context, { entry, ...options });
        });

    program
        .command('build [entry]')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
        .option('-p, --prod [prod]', 'Create a production build')
        .description('build a application')
        .action((entry, options) => {
            loadCommand(context, 'build', '@malagu/cli-service').default(context, { entry, ...options });
        });

    program
        .command('deploy [entry]')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
        .option('-p, --prod [prod]', 'Create a production deployment')
        .option('-s, --skip-build [skipBuild]', 'Skip the build process')
        .description('deploy a applicaton')
        .action((entry, options) => {
            loadCommand(context, 'deploy', '@malagu/cli-service').default(context, { entry, ...options });
        });

    const runtimeCmd = program
        .command('runtime [command]')
        .description('management runtime');

    runtimeCmd
        .command('install [runtime] [alias]')
        .description('install a runtime')
        .option('-v, --version [version]', 'Specify runtime version', 'latest')
        .action((runtime, alias, options) => {
            require('@malagu/cli-runtime/lib/install/install').default({ runtime, alias, ...options });
        });
    runtimeCmd
        .command('use [runtime]')
        .description('use a runtime')
        .action(runtime => {
            require('@malagu/cli-runtime/lib/use/use').default({ runtime });
        });

    runtimeCmd
        .command('list')
        .description('list all runtimes')
        .action(() => {
            require('@malagu/cli-runtime/lib/list/list').default({});
        });

    runtimeCmd
        .command('uninstall [runtime]')
        .description('uninstall a runtime')
        .action(runtime => {
            require('@malagu/cli-runtime/lib/uninstall/uninstall').default({ runtime });
        });

    await executeHook(context, 'Cli');
    spinner.stop();

    program
        .arguments('[command]')
        .action(cmd => {
            program.outputHelp();
            if (cmd) {
                console.log();
                console.log(chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
                console.log();
                suggestCommands(cmd, program);
            }

        });

    runtimeCmd
        .arguments('[command]')
        .action(cmd => {
            runtimeCmd.outputHelp();
            if (cmd) {
                console.log();
                console.log(chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
                console.log();
                suggestCommands(cmd, runtimeCmd);
            }

        });
    program.addHelpText('after', '\nUse "malagu [command] --help" for more information about a command.');
    program.parse(process.argv);

})().catch(error => {
    spinner.stop();
    console.error(error);
    process.exit(-1);
});

function suggestCommands(unknownCommand: string, main: Command) {
    const availableCommands = main.commands.map((cmd: Command) => cmd.name());

    let suggestion: string = '';

    availableCommands.forEach((cmd: string) => {
        const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);
        if (leven(cmd, unknownCommand) <= 3 && isBestMatch) {
            suggestion = cmd;
        }
    });

    if (suggestion) {
        console.log(`  ${chalk.yellow(`Did you mean ${chalk.green(suggestion)}?`)}`);
    }
}

