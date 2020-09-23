
import * as program from 'commander';
import { InitManager } from './init-manager';

program
    .name('malagu init')
    .usage('[options] [name] [template]')
    .option('-o, --output-dir [path]', 'output directory', '.')
    .description('init a application')
    .parse(process.argv);

(async () => {
    const [ name, template ] = program.args;
    const outputDir = program.outputDir;
    const initManager = new InitManager({ name, template, outputDir, program });
    await initManager.output();
    await initManager.render();
    await initManager.install();
    await initManager.executeHooks();
})().catch(err => {
    console.error(err);
    process.exit(-1);
});
