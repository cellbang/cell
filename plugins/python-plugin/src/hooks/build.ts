import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils';
import { buildCode, injectRequirements, parsePythonOptions, Pip, pipfileToRequirements } from '../packager';

export default async (ctx: CliContext) => {
    const { cfg } = ctx;
    let pluginOptions = ConfigUtil.getBackendCellConfig(cfg)['python-plugin'] || {};
    pluginOptions = parsePythonOptions(pluginOptions);
    await pipfileToRequirements(pluginOptions);
    await new Pip().install(pluginOptions);
    injectRequirements(pluginOptions);
    buildCode(pluginOptions);
};
