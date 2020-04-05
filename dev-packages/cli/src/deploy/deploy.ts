
import * as program from 'commander';
import { HookExecutor } from '../hook/hook-executor';
import { HookContext, CliContext } from '../context';
import { BuildManager } from '../build/build-manager';

program
    .name('malagu deploy')
    .usage('[options]')
    .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [])
    .option('-p, --prod [prod]', 'Create a production deployment')
    .description('deploy a applicaton')
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
    const hookExecutor = new HookExecutor();
    await hookExecutor.executeDeployHooks(hookContext);
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
