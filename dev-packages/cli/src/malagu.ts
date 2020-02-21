import * as program from 'commander';
const pkg = require('../package.json');
program
    .version(pkg.version)
    .command('init [name]', 'init a application')
    .command('serve [options]', 'serve a applicaton')
    .command('build [options]', 'build a application')
    .command('deploy [options]', 'deply a application')
    .parse(process.argv);
