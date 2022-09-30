import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@malagu/cli-common/lib/utils';
import { injectRequirements, Pip, pipfileToRequirements } from '../packager';
import { PythonPluginOptions } from '../python-plugin-protocol';

const parsePythonOptions = (options: PythonPluginOptions) => {
   
      if (options.dockerizePip && process.platform === 'win32') {
        options.pythonBin = 'python';
      }
      if (options.dockerImage && options.dockerFile) {
        throw new Error('Python Requirements: you can provide a dockerImage or a dockerFile option, not both.');
      }
};

export default async (ctx: CliContext) => {
    const { cfg } = ctx;
    const pluginOptions = ConfigUtil.getBackendMalaguConfig(cfg)['python-plugin'];
    parsePythonOptions(pluginOptions);
    await pipfileToRequirements(pluginOptions);
    await new Pip().install(pluginOptions);
    injectRequirements(pluginOptions)

};
