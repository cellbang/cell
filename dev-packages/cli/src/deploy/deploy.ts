
import * as program from 'commander';
import { HookExecutor } from '../hook/hook-executor';
import { ContextUtils } from '../context';
import { BuildManager } from '../build/build-manager';

program
    .name('malagu deploy [entry]')
    .usage('[options]')
    .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
    .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
    .option('-p, --prod [prod]', 'Create a production deployment')
    .option('-s, --skip-build [skipBuild]', 'Skip the build process')
    .description('deploy a applicaton')
    .parse(process.argv);
(async () => {
    let mode = program.mode;
    mode = ['remote', ...mode.filter((m: any) => m !== 'remote')];
    const ctx = await ContextUtils.createDeployContext(program, {
        mode,
        dev: false,
        entry: program.args.length > 0 ? program.args[0] : undefined,
        targets: program.targets,
        prod: program.prod
    });
    if (!program.skipBuild) {
        await new BuildManager(ctx).build();
    }
    const hookExecutor = new HookExecutor();
    await hookExecutor.executeDeployHooks(ctx);
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
