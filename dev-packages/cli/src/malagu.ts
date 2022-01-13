const leven = require('leven');
import * as ora from 'ora';
import { HookExecutor } from '@malagu/cli-common/lib/hook/hook-executor';
import { CommandUtil } from '@malagu/cli-common/lib/utils/command-util';
import { program, Command } from '@malagu/cli-common/lib/command/command-protocol';
import { BannerUtil } from './utils/banner-util';
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const version = pkg.version;
updateNotifier({ pkg }).notify();

const spinner = ora({ text: chalk.italic.gray('loading command line context...\n'), discardStdin: false });

(async () => {
    const { runtime, framework, settings } = JSON.parse(process.env.MALAGU_RFS!);
    BannerUtil.print(version, settings, runtime, framework);

    spinner.start();
    const context = await CommandUtil.loadContext(settings, framework, runtime, undefined, spinner);
    const { componentPackages, configHookModules, webpackHookModules, serveHookModules, buildHookModules, deployHookModules, infoHookModules, propsHookModules } = context.pkg;

    if (CommandUtil.includesCommand(context.args, settings.compileCommands)) {
        process.send!({
            type: 'cliContext',
            data: {
                components: componentPackages.map(c => c.malaguComponent),
                configHookModules,
                webpackHookModules,
                serveHookModules,
                buildHookModules,
                deployHookModules,
                infoHookModules,
                propsHookModules
            }
        });
    }
    program
        .version(version, '-v, --version', 'version for malagu')
        .option('-t, --targets [targets]', 'targets for malagu', value => value ? value.split(',') : [])
        .option('-m, --mode [mode]', 'mode for malagu', value => value ? value.split(',') : [])
        .usage('<command> [options]');

    program
        .command('init [name] [template]')
        .option('-o, --output-dir [path]', 'output directory', '.')
        .description('init a application')
        .action((name, template, options) => {
            require('./init/init').default({ name, template, outputDir: '.', ...options });
        });
    program
        .command('props')
        .description('display properties about application')
        .option('-n, --name [name]', 'get the property value of the specified name')
        .option('-f, --frontend [frontend]', 'frontend properties')
        .option('-b, --backend [backend]', 'backend properties')
        .action(options => {
            require('./props/props').default(context, { ...options });
        });
    program
        .command('info')
        .description('display information about application')
        .action(options => {
            require('./info/info').default(context, { ...options });
        });

    program
        .command('config')
        .option('--default-runtime [defaultRuntime]', 'default runtime')
        .option('--default-mode [defaultMode]', 'default mode', value => value ? value.split(',') : [])
        .option('--frameworks-url [frameworksUrl]', 'frameworks url')
        .option('--frameworks-upstream-url [frameworksUpStreamUrl]', 'frameworks upstream url')
        .option('--config-file-alias [configFileAlias]', 'config file alias')
        .option('--show [show]', 'show properties for the application')
        .description('configure properties for the application')
        .action(options => {
            require('./config/config').default(context, { ...options });
        });

    const runtimeCmd = program
        .command('runtime [command]')
        .alias('r')
        .description('management runtime');
    runtimeCmd
        .command('install [runtime] [alias]')
        .alias('i')
        .description('install a runtime')
        .option('-f, --force-install-component [forceInstallComponent]', 'force install component')
        .option('-o, --overwrite [overwrite]', 'overwrite existing runtime')
        .option('-v, --version [version]', 'specify runtime version', 'latest')
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
        .alias('ls')
        .description('list all runtimes')
        .action(() => {
            require('@malagu/cli-runtime/lib/list/list').default({});
        });

    runtimeCmd
        .command('uninstall [runtime]')
        .alias('u')
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

