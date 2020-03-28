import * as program from 'commander';
const pkg = require('../package.json');
console.log(`
                   ___
 /'\\_/\`\\          /\\_ \\
/\\      \\     __  \\//\\ \\      __       __   __  __
\\ \\ \\__\\ \\  /'__\`\\  \\ \\ \\   /'__\`\\   /'_ \`\\/\\ \\/\\ \\
 \\ \\ \\_/\\ \\/\\ \\L\\.\\_ \\_\\ \\_/\\ \\L\\.\\_/\\ \\L\\ \\ \\ \\_\\ \\
  \\ \\_\\\\ \\_\\ \\__/.\\_\\/\\____\\ \\__/.\\_\\ \\____ \\ \\____/
   \\/_/ \\/_/\\/__/\\/_/\\/____/\\/__/\\/_/\\/___L\\ \\/___/
                                       /\\____/
                 ${pkg.version.padStart(20, ' ')}  \\_/__/
`);

program
    .version(pkg.version)
    .description(`Malagu CLI ${pkg.version}`)
    .command('init [name]', 'init a application')
    .command('serve [options]', 'serve a applicaton')
    .command('build [options]', 'build a application')
    .command('deploy [options]', 'deply a application')
    .parse(process.argv);
