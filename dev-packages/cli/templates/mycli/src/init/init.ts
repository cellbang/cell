
import 'reflect-metadata';
require('source-map-support').install();import * as program from 'commander';
import { InitManager } from './init-manager';
import { Container } from 'inversify';
import { CoreBackendModule } from '@malagu/core/lib/node/module';
import { MycliModule } from '../module';
import { CONTEXT } from '../constants';


program
    .name('malagu init')
    .usage('[options] [name]')
    .option('-o, --output-dir [path]', 'output directory', '.')
    .description('init a application')
    .parse(process.argv);

(async () => {
    let name = undefined;
    if (program.args.length > 0) {
        name = program.args[0];
    }
    const outputDir = program.outputDir;
    const container = new Container();
    container.bind(CONTEXT).toConstantValue({ name, outputDir, program })
    container.load(CoreBackendModule, MycliModule);
    const initManager = container.get(InitManager);
    await initManager.output();
})();
