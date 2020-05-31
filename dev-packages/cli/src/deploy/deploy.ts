
import * as program from 'commander';
import { HookExecutor } from '../hook/hook-executor';
import { ContextUtils } from '../context';
import { BuildManager } from '../build/build-manager';

program
    .name('malagu deploy')
    .usage('[options]')
    .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [])
    .option('-p, --prod [prod]', 'Create a production deployment')
    .option('-s, --skipBuild [skipBuild]', 'Skip the build process')
    .description('deploy a applicaton')
    .parse(process.argv);
(async () => {
    let mode = program.mode || [];
    mode = ['remote', ...mode.filter((m: any) => m !== 'remote')];
    const ctx = await ContextUtils.createDeployContext(program, {
        mode,
        dev: false,
        prod: program.prod
    });
    if (!program.skipBuild || mode.length > 1) {
        await new BuildManager(ctx).build();
    }
    const hookExecutor = new HookExecutor();
    await hookExecutor.executeDeployHooks(ctx);
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
