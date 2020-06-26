
import * as program from 'commander';
import { ServeManager } from './serve-manager';
import { ContextUtils } from '../context';

program
    .name('malagu serve [entry]')
    .usage('[options]')
    .option('-o, --open [open]', 'Open browser')
    .option('-p, --port [port]', 'Port used by the server')
    .option('-t, --targets [targets]', 'Specify application targets', value => value ? value.split(',') : [], [])
    .option('-m, --mode [mode]', 'Specify application mode', value => value ? value.split(',') : [], [])
    .description('serve a applicaton')
    .parse(process.argv);

(async () => {
    let mode = program.mode;
    mode = ['local', ...mode.filter((m: any) => m !== 'local')];
    const ctx = await ContextUtils.createConfigurationContext(program, {
        mode,
        dev: true,
        targets: program.targets,
        entry: program.args.length > 0 ? program.args[0] : undefined,
        open: program.open,
        port: program.port
    });
    if (ctx.configurations.length === 0) {
        throw new Error('No malagu module found.');
    }
    new ServeManager(ctx).start();

})().catch(err => {
    console.error(err);
    process.exit(-1);
});
