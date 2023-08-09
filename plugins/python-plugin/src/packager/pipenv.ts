import { writeFileSync, ensureDirSync, existsSync } from 'fs-extra';
import { join } from 'path';
import { spawnProcess } from '@malagu/cli-common/lib/packager';
import { EOL } from 'os';
import { PythonPluginOptions } from '../python-plugin-protocol';
import { PathUtil } from '@malagu/cli-common/lib/utils';

/**
 * pipenv install
 */
export async function pipfileToRequirements(options: PythonPluginOptions) {
    if (!options.usePipenv || !existsSync(join(process.cwd(), 'Pipfile'))) {
        return;
    }

    console.info('Generating requirements.txt from Pipfile...');

    const { stderr, stdout } = await spawnProcess(
        'pipenv',
        ['lock', '--requirements', '--keep-outdated'],
        {
            cwd: process.cwd(),
        }
    );
    if (stderr) {
        if (stderr.toString().includes('command not found')) {
            throw new Error('pipenv not found! Install it according to the poetry docs.');
        }
        throw new Error(stderr);
    }
    const projectHomeDir = PathUtil.getProjectHomePath();

    ensureDirSync(projectHomeDir);
    writeFileSync(join(projectHomeDir, 'requirements.txt'), removeEditableFlagFromRequirementsString(stdout));
}

function removeEditableFlagFromRequirementsString(requirementStdout: string) {
    const flagStr = '-e ';
    const lines = requirementStdout.split(EOL);
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(flagStr)) {
            lines[i] = lines[i].substring(flagStr.length);
        }
    }
    return Buffer.from(lines.join(EOL));
}
