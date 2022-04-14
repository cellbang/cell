import { bootstrap } from '../bootstrap';
import * as program from 'commander';
import { InitManager } from './init-manager';
import { CONTEXT } from '../constants';
import { ContainerProvider } from '@malagu/core';

program
    .name('malagu init')
    .usage('[options] [name]')
    .option('-o, --output-dir [path]', 'output directory', '.')
    .description('init a application')
    .parse(process.argv);

(async () => {
    await bootstrap();
    let name = undefined;
    if (program.args.length > 0) {
        name = program.args[0];
    }
    const outputDir = program.outputDir;
    const container = await ContainerProvider.asyncProvide();
    container.bind(CONTEXT).toConstantValue({ name, outputDir, program })
    const initManager = container.get(InitManager);
    await initManager.output();
})();
