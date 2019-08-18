
import * as program from 'commander';
import { InitManager } from './init-manager';

program
    .name('malagu init')
    .usage('[options] [name]')
    .option('-o, --output-dir [path]', 'output directory', '.')
    .description('init a application')
    .parse(process.argv);

(async () => {
    const context: any = {
        name: 'malagu-app'
    };
    if (program.args.length > 0) {
        context.name = program.args[0];
    }
    context.outputDir = program.outputDir;
    const initManager = new InitManager(context);
    await initManager.output();
    await initManager.render();
    await initManager.install();
    await initManager.executeHooks();
})();
