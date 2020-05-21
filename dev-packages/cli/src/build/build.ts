
import * as program from 'commander';
import { CliContext, HookContext } from '../context';
import { BuildManager } from './build-manager';

program
    .name('malagu build')
    .usage('[options]')
    .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [])
    .description('build a application')
    .parse(process.argv);
(async () => {
    let mode = program.mode || [];
    mode = ['remote', ...mode.filter((m: any) => m !== 'remote')];
    const cliContext = await CliContext.create(program, mode);
    cliContext.dev = false;
    cliContext.mode = mode;
    cliContext.prod = program.prod;
    const hookContext = await HookContext.create(cliContext);
    await new BuildManager(hookContext).build();
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
