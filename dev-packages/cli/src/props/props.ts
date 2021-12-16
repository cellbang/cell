
import { CliContext, ContextUtils, ConfigUtil } from '@malagu/cli-common';
import { dump } from 'js-yaml';
import * as traverse from 'traverse';
const chalk = require('chalk');

export interface PropsOptions {
    backend?: boolean;
    frontend?: boolean;
    name?: string;
}

export default async (cliContext: CliContext, options: PropsOptions) => {
    try {
        cliContext.options = options;
        const ctx = await ContextUtils.createInfoContext(cliContext);
        let backendProps: any;
        let frontendProps: any;

        if (options.frontend) {
            frontendProps = ConfigUtil.getFrontendConfig(ctx.cfg);
        } else if (options.backend) {
            backendProps = ConfigUtil.getBackendConfig(ctx.cfg);
        } else {
            frontendProps = ConfigUtil.getFrontendConfig(ctx.cfg);
            backendProps = ConfigUtil.getBackendConfig(ctx.cfg);
        }

        if (frontendProps) {
            console.log(chalk`{bold.magenta - Frontend: }`);
            if (options.name) {
                console.log(`${options.name}: ${traverse(frontendProps).get(options.name.split('.'))}`);
            } else {
                console.log(dump(ConfigUtil.getFrontendConfig(ctx.cfg), { skipInvalid: true }));
            }
        }
        if (backendProps) {
            console.log(chalk`{bold.magenta - Backend: }`);
            if (options.name) {
                console.log(`${options.name}: ${traverse(backendProps).get(options.name.split('.'))}`);
            } else {
                console.log(dump(ConfigUtil.getBackendConfig(ctx.cfg), { skipInvalid: true }));
            }
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
