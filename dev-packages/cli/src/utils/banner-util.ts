import { Runtimes } from '@malagu/cli-runtime/lib/runtime-protocol';
import { Framework } from '@malagu/frameworks/lib/detector';
import { Settings } from '@malagu/cli-common/lib/settings/settings-protocol';

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
            runtimeStrLine += chalk.yellow.bold(runtimeStr.padStart(25 + Math.floor(runtimeStr.length / 2)).padEnd(50)) + '│';
        }
        const banner = process.env.MALAGU_BANNER || settings.banner;
        if (banner) {
            console.log(banner.replace('{ version }', version).replace('{ runtime }', runtimeStr));
        } else {
            console.log(`
                   ___
 /'\\_/\`\\          /\\_ \\
/\\      \\     __  \\//\\ \\      __       __   __  __
\\ \\ \\__\\ \\  /'__\`\\  \\ \\ \\   /'__\`\\   /'_ \`\\/\\ \\/\\ \\
 \\ \\ \\_/\\ \\/\\ \\L\\.\\_ \\_\\ \\_/\\ \\L\\.\\_/\\ \\L\\ \\ \\ \\_\\ \\
  \\ \\_\\\\ \\_\\ \\__/.\\_\\/\\____\\ \\__/.\\_\\ \\____ \\ \\____/
   \\/_/ \\/_/\\/__/\\/_/\\/____/\\/__/\\/_/\\/___L\\ \\/___/
                                       /\\____/
${chalk.italic((('@malagu/cli@' + version) as any).padStart(37))}  \\_/__/

╭──────────────────────────────────────────────────╮
│      Serverless First Development Framework      │${runtimeStrLine}
╰──────────────────────────────────────────────────╯
`);
        }
    }
}
