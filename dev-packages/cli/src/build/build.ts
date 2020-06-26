
import * as program from 'commander';
import { ContextUtils } from '../context';
import { BuildManager } from './build-manager';

program
    .name('malagu build [entry]')
    .usage('[options]')
    .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
    .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
    .option('-p, --prod [prod]', 'Create a production build')
    .description('build a application')
    .parse(process.argv);
(async () => {
    let mode = program.mode;
    mode = ['remote', ...mode.filter((m: any) => m !== 'remote')];
    const ctx = await ContextUtils.createBuildContext(program, {
        dev: false,
        mode,
        entry: program.args.length > 0 ? program.args[0] : undefined,
        targets: program.targets,
        prod: program.prod
    });
    await new BuildManager(ctx).build();
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
