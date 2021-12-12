const leven = require('leven');
import * as ora from 'ora';
import { HookExecutor, CommandUtil, program, Command } from '@malagu/cli-common';
import { Runtimes, RuntimeUtil } from '@malagu/cli-runtime';
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const version = pkg.version;
updateNotifier({ pkg }).notify();

const spinner = ora({ text: chalk.italic.gray('loading command line context...\n'), discardStdin: false });

(async () => {
    const { runtime, framework, settings } = await RuntimeUtil.initRuntime();
    let runtimeStrLine = '';
    if (runtime && runtime !== Runtimes.empty) {
        let runtimeStr = runtime;
        if (framework) {
            runtimeStr = runtime === Runtimes.default ? framework.name : `${runtime}.${framework.name}`;
        }
        runtimeStrLine = '\n│';
        runtimeStrLine += chalk.yellow(`Runtime<${runtimeStr}>`.padStart(25 + Math.floor((9 + runtimeStr.length) / 2)).padEnd(50)) + '│';
    }
    const banner = process.env.MALAGU_BANNER || settings.banner;
    if (banner) {
        console.log(banner.replace('{ version }', version).replace('{ runtime }', runtimeStrLine));
    } else {
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
│      Serverless Frist Development Framework      │${runtimeStrLine}
╰──────────────────────────────────────────────────╯
`);
    }

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
        .command('info')
        .description('display information about application')
        .action(options => {
            require('./info/info').default(context, { ...options });
        });

    program
        .command('config')
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

