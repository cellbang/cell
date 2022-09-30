import { PythonPluginOptions } from '../python-plugin-protocol';
import { writeFileSync, readFileSync, ensureDirSync, moveSync, existsSync } from 'fs-extra';
import { join } from 'path';
import { spawnProcess } from '@malagu/cli-common/lib/packager';
import { PathUtil } from '@malagu/cli-common/lib/utils';
const tomlParse = require('@iarna/toml/parse-string');

export class Poetry {

    isPoetryProject(cwd = process.cwd()) {
        const pyprojectPath = join(cwd, 'pyproject.toml');

        if (!existsSync(pyprojectPath)) {
            return false;
        }

        const pyprojectToml = readFileSync(pyprojectPath);
        const pyproject = tomlParse(pyprojectToml);

        const buildSystemReqs =
            (pyproject['build-system'] && pyproject['build-system']['requires']) || [];

        for (let i = 0; i < buildSystemReqs.length; i++) {
            if (buildSystemReqs[i].startsWith('poetry')) {
                return true;
            }
        }

        return false;
    }

    async pyprojectTomlToRequirements(options: PythonPluginOptions) {

        if (!options.usePoetry || !this.isPoetryProject()) {
            return;
        }

        console.log('Generating requirements.txt from pyproject.toml...');

        const { stderr } = await spawnProcess(
            'poetry',
            [
                'export',
                '--without-hashes',
                '-f',
                'requirements.txt',
                '-o',
                'requirements.txt',
                '--with-credentials',
            ],
            {
                cwd: process.cwd(),
            }
        );

        if (stderr) {
            if (stderr.toString().includes('command not found')) {
                throw new Error('poetry not found! Install it according to the poetry docs.');
            }
            throw new Error(stderr);
        }

        const editableFlag = new RegExp(/^-e /gm);
        const sourceRequirements = join(process.cwd(), 'requirements.txt');
        const requirementsContents = readFileSync(sourceRequirements, {
            encoding: 'utf-8',
        });

        if (requirementsContents.match(editableFlag)) {
            console.info('The generated file contains -e flags, removing them');
            writeFileSync(
                sourceRequirements,
                requirementsContents.replace(editableFlag, '')
            );
        }

        const projectHomeDir = PathUtil.getProjectHomePath();
        ensureDirSync(projectHomeDir);

        moveSync(
            sourceRequirements,
            join(projectHomeDir, 'requirements.txt'),
            { overwrite: true }
        );
    }
}
