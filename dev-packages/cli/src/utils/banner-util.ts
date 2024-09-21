import { Runtimes } from '@celljs/cli-runtime/lib/runtime-protocol';
import { Framework } from '@celljs/frameworks/lib/detector/detector-protocol';
import { Settings } from '@celljs/cli-common/lib/settings/settings-protocol';

const chalk = require('chalk');

export namespace BannerUtil {
    export function print(version: string, settings: Settings, runtime?: string, framework?: Framework) {
        let runtimeStrLine = '';
        let runtimeStr = '';
        if (runtime && runtime !== Runtimes.empty) {
            runtimeStr = runtime;
            if (framework) {
                runtimeStr = runtime === Runtimes.default ? framework.name : `${runtime}.${framework.name}`;
            }
            runtimeStr = `Runtime<${runtimeStr}>`;
            runtimeStrLine = '\n│';
            runtimeStrLine += chalk.yellow.bold(runtimeStr.padStart(20 + Math.floor(runtimeStr.length / 2)).padEnd(40)) + '│';
        }
        const banner = process.env.MALAGU_BANNER || settings.banner;
        if (banner) {
            console.log(banner.replace('{ version }', version).replace('{ runtime }', runtimeStr));
        } else {
            const versionStr = `@celljs/cli@${version}`;
            const versionStrLine = `\n│${chalk.yellow.bold(versionStr.padStart(20 + Math.floor(versionStr.length / 2)).padEnd(40))}│`;
            console.log(`
 ____            ___    ___
/\\  _\`\\         /\\_ \\  /\\_ \\
\\ \\ \\/\\_\\     __\\//\\ \\ \\//\\ \\
 \\ \\ \\/_/_  /'__\`\\\\ \\ \\  \\ \\ \\
  \\ \\ \\L\\ \\/\\  __/ \\_\\ \\_ \\_\\ \\_
   \\ \\____/\\ \\____\\/\\____\\/\\____\\
    \\/___/  \\/____/\\/____/\\/____/
                                                             
╭────────────────────────────────────────╮
│       Cell Development Framework       │${versionStrLine}${runtimeStrLine}
╰────────────────────────────────────────╯
`);
        }
    }
}
