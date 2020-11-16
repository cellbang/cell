import * as program from 'commander';
import { CliContext, ContextUtils } from './context';
import { HookExecutor } from './hook';
const leven = require('leven');
import * as ora from 'ora';
const chalk = require('chalk');

const minimist = require('minimist');
const { version } = require('../package.json');

console.log(`
                   ___
 /'\\_/\`\\          /\\_ \\
/\\      \\     __  \\//\\ \\      __       __   __  __
\\ \\ \\__\\ \\  /'__\`\\  \\ \\ \\   /'__\`\\   /'_ \`\\/\\ \\/\\ \\
 \\ \\ \\_/\\ \\/\\ \\L\\.\\_ \\_\\ \\_/\\ \\L\\.\\_/\\ \\L\\ \\ \\ \\_\\ \\
  \\ \\_\\\\ \\_\\ \\__/.\\_\\/\\____\\ \\__/.\\_\\ \\____ \\ \\____/
   \\/_/ \\/_/\\/__/\\/_/\\/____/\\/__/\\/_/\\/___L\\ \\/___/
                                       /\\____/
${(('@malagu/cli@' + version) as any).padStart(37, ' ')}  \\_/__/
`);

function getArrayOptions(options: any, prop: string, shortProp: string) {
    const value = options[prop] || options[shortProp];
    if (Array.isArray(value)) {
        return value.reduce((accumulator, currentValue) => [...accumulator, ...currentValue.split(',')], []);
    } else if (typeof value === 'string') {
        return value.split(',');
    }
    return [];
}

function getMode(options: any) {
    const mode = getArrayOptions(options, 'mode', 'm');

    let fixedMode: string[] = [];
    if (options._.includes('serve')) {
        fixedMode = ['local'];
    } else if (options._.includes('build') || options._.includes('deploy')) {
        fixedMode = ['remote'];
    }
    return [...fixedMode, ...mode.filter((m: any) => fixedMode.indexOf(m) === -1)];
}

function isDev(options: any) {

    return options._.includes('serve');
}

function getTargets(options: any) {
    return getArrayOptions(options, 'targets', 't');
}

const spinner = ora({ text: 'loading command line context...', discardStdin: false }).start();

(async () => {
    program
        .version(version)
        .description(`Malagu CLI ${version}`)
        .usage('<command> [options]');

    program
        .command('init [name] [template]')
        .option('-o, --output-dir [path]', 'output directory', '.')
        .description('init a application')
        .action((name, template, cmd) => {
            require('./init/init').default({ name, template, outputDir: '.', ...parseOptions(cmd) });
        });

    program
        .command('serve [entry]')
        .option('-o, --open [open]', 'Open browser')
        .option('-p, --port [port]', 'Port used by the server')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [])
        .description('serve a applicaton')
        .action((entry, cmd) => {
            require('./serve/serve').default({ entry, ...parseOptions(cmd) });
        });

    program
        .command('build [entry]')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
        .option('-p, --prod [prod]', 'Create a production build')
        .description('build a application')
        .action((entry, cmd) => {
            require('./build/build').default({ entry, ...parseOptions(cmd) });
        });

    program
        .command('deploy [entry]')
        .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
        .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
        .option('-p, --prod [prod]', 'Create a production deployment')
        .option('-s, --skip-build [skipBuild]', 'Skip the build process')
        .description('deploy a applicaton')
        .action((entry, cmd) => {
            require('./deploy/deploy').default({ entry, ...parseOptions(cmd) });
        });

    const options = minimist(process.argv.slice(2));
    const mode = getMode(options);
    const targets = getTargets(options);
    const prod = options.p || options.prod;
    const context = await CliContext.create(program, { targets, mode, prod, dev: isDev(options) });
    ContextUtils.setCurrent(context);
    await new HookExecutor().executeCliHooks(context);
    spinner.stop();

    program
        .arguments('<command>')
        .action(cmd => {
          program.outputHelp();
          console.log('  ' + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
          console.log();
          suggestCommands(cmd);
    });
    program.parse(process.argv);

})().catch(error => {
    spinner.stop();
    console.error(error);
    process.exit(-1);
});

function camelize(str: string) {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '');
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function parseOptions<T>(cmd: program.Command): T {
    const options: { [key: string]: any } = {};
    cmd.options.forEach((o: program.Option) => {
        const key = camelize(o.long.replace(/^--/, ''));
        // if an option is not present and Command has a method with the same name
        // it should not be copied
        if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
            options[key] = cmd[key];
        }
    });
    return <T>options;
}

function suggestCommands(unknownCommand: string) {
    const availableCommands = program.commands.map((cmd: program.Command) => cmd._name);

    let suggestion: string = '';

    availableCommands.forEach((cmd: string) => {
        const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);
        if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
            suggestion = cmd;
        }
    });

    if (suggestion) {
        console.log(`  ${chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`)}`);
    }
}

