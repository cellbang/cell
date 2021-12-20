import { existsSync, readJson, writeJSON, ensureDirSync } from 'fs-extra';
import { dirname } from 'path';
import * as randomize from 'randomatic';
import { PathUtil } from './path-util';

export interface Project {
    projectId?: string;
}

export namespace ProjectUtil {

    export async function createProjectId() {
        return randomize('a0', 5);
    }

    export async function getProjectId() {
        const projectPath = PathUtil.getProjectConfigPath();
        if (existsSync(projectPath)) {
            const project = await readJson(projectPath);
            return project?.projectId;
        }
    }

    export async function saveProjectId(projectId?: string) {
        const projectPath = PathUtil.getProjectConfigPath();
        let project: Project;
        if (existsSync(projectPath)) {
            project = await readJson(projectPath) || { };
            project.projectId = projectId;
        } else {
            ensureDirSync(dirname(projectPath));
            project = { projectId };
        }
        await writeJSON(projectPath, project);
    }

}
