
import * as program from 'commander';
import { HookExecutor } from '../hook/hook-executor';
import { HookContext, CliContext } from '../context';

program
    .name('malagu deploy')
    .usage('[options]')
    .option('-p, --prod [prod]', 'Create a production deployment')
    .description('deploy a applicaton')
    .parse(process.argv);
(async () => {
    const context = await HookContext.create(await CliContext.create(program));
    context.prod = program.prod;

    const hookExecutor = new HookExecutor();
    await hookExecutor.executeDeployHooks(context);
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
