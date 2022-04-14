import * as program from 'commander';
import { bootstrap } from './bootstrap';
const pkg = require('../package.json');

(async () => {
  await bootstrap();
  program
    .version(pkg.version)
    .command('init [name]', 'init a fc application')
    .command('deploy [options]', 'deply a fc application')
    .parse(process.argv);

})();