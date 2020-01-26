
import * as program from 'commander';
import { InitManager } from './init-manager';

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
    const initManager = new InitManager({ name, outputDir, program });
    await initManager.output();
    await initManager.render();
    await initManager.install();
    await initManager.executeHooks();
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
