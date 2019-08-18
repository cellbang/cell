
import * as program from 'commander';
import { HookExecutor } from '../hook/hook-executor';

program
    .name('malagu deploy')
    .usage('[options]')
    .description('deploy a applicaton')
    .parse(process.argv);
(async () => {
    const hookExecutor = new HookExecutor();
    await hookExecutor.executeDeployHooks();
})();
