import { program, Command } from 'commander';

const leven = require('leven');
import * as ora from 'ora';
import { HookExecutor } from '@malagu/cli-common';
import { loadContext, initRuntime } from './util';
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const version = pkg.version;
updateNotifier({ pkg }).notify();

const spinner = ora({ text: chalk.italic.gray('loading command line context...\n'), discardStdin: false });

(async () => {
    const runtime = await initRuntime();
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
│      Serverless Frist Development Framework      │${runtime ? '\n│' +
chalk.yellow(`Runtime<${runtime}>`.padStart(25 + Math.floor((9 + runtime.length) / 2)).padEnd(50)) + '│' : ''}
╰──────────────────────────────────────────────────╯
`);

    spinner.start();
    const context = await loadContext(program, spinner, runtime);
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

    const runtimeCmd = program
        .command('runtime [command]')
        .alias('r')
        .description('management runtime');

    runtimeCmd
        .command('install [runtime] [alias]')
        .alias('i')
        .description('install a runtime')
        .option('-v, --version [version]', 'Specify runtime version', 'latest')
        .action((r, alias, options) => {
            require('@malagu/cli-runtime/lib/install/install').default({ runtime: r, alias, ...options });
        });
    runtimeCmd
        .command('use [runtime]')
        .description('use a runtime')
        .action(r => {
            require('@malagu/cli-runtime/lib/use/use').default({ runtime: r });
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
        .action(r => {
            require('@malagu/cli-runtime/lib/uninstall/uninstall').default({ runtime: r });
        });

    await new HookExecutor().executeHooks(context, 'cliHooks');
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

    console.log(availableCommands);

    let suggestion: string = '';

    availableCommands.forEach((cmd: string) => {
        const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion, unknownCommand);
        if (leven(cmd, unknownCommand) <= 3 && isBestMatch) {
            suggestion = cmd;
        }
    });

    if (suggestion) {
        console.log(`  ${chalk.yellow(`Did you mean ${chalk.green(suggestion)}?`)}`);
    }
}

