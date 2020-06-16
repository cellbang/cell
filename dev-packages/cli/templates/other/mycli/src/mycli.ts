import * as program from 'commander';
const pkg = require('../package.json');
program
  .version(pkg.version)
  .command('init [name]', 'init a fc application')
  .command('deploy [options]', 'deply a fc application')
  .parse(process.argv);
