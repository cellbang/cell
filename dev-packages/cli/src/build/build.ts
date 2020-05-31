
import * as program from 'commander';
import { ContextUtils } from '../context';
import { BuildManager } from './build-manager';

program
    .name('malagu build')
    .usage('[options]')
    .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [])
    .option('-p, --prod [prod]', 'Create a production build')
    .description('build a application')
    .parse(process.argv);
(async () => {
    let mode = program.mode || [];
    mode = ['remote', ...mode.filter((m: any) => m !== 'remote')];
    const ctx = await ContextUtils.createBuildContext(program, {
        dev: false,
        mode,
        prod: program.prod
    });
    await new BuildManager(ctx).build();
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
