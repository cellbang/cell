import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import * as path from 'path';
import { homedir } from 'os';
import { RuntimeUtil } from './runtime-util';

export namespace PathUtil {
    export function getProjectDistPathForTarget(target: string) {
        return path.resolve(getProjectDistPath(), target);
    }

    export function getProjectDistPath() {
        if (process.env.MALAGU_PROJECT_DIST_PATH) {
            return path.resolve(process.cwd(), process.env.MALAGU_PROJECT_DIST_PATH);
        }
        return path.resolve(getProjectHomePath(), 'dist');
    }

    export function getProjectDistParentPath() {
        return path.resolve(getProjectHomePath(), 'dist');
    }

    export function getBackendProjectDistPath() {
        return getProjectDistPathForTarget(BACKEND_TARGET);
    }

    export function getFrontendProjectDistPath() {
        return getProjectDistPathForTarget(FRONTEND_TARGET);
    }
    export function getProjectHomePathForTarget(target: string) {
        return path.resolve(getProjectHomePath(), target);
    }

    export function getBackendProjectHomePath() {
        return getProjectHomePathForTarget(BACKEND_TARGET);
    }

    export function getFrontendProjectHomePath() {
        return getProjectHomePathForTarget(FRONTEND_TARGET);
    }

    export function getProjectHomePath() {
        return process.env.MALAGU_PROJECT_HOME_PATH ? path.resolve(process.cwd(), process.env.MALAGU_PROJECT_HOME_PATH) : path.resolve(process.cwd(), '.malagu');
    }

    export function getProjectConfigPath() {
        return process.env.MALAGU_PROJECT_CONFIG_PATH ? path.resolve(process.cwd(), process.env.MALAGU_PROJECT_CONFIG_PATH) : path.resolve(getProjectHomePath(), 'project.json');
    }

    export function setProjectHomePath(projectHomePath: string) {
        process.env.MALAGU_PROJECT_HOME_PATH = projectHomePath;
    }

    export function getMalaguHomePath() {
        return process.env.MALAGU_HOME_PATH ? process.env.MALAGU_HOME_PATH : path.join(homedir(), '.malagu');
    }

    export function getGlobalMalaguConfigPath() {
        return process.env.GLOBAL_MALAGU_CONFIG_PATH ? process.env.GLOBAL_MALAGU_CONFIG_PATH : path.resolve(getMalaguHomePath(), 'malagu.yml');
    }

    export function getRuntimePath(runtime?: string) {
        if (runtime) {
            const basePath = process.env.MALAGU_RUNTIME_PATH ? process.env.MALAGU_RUNTIME_PATH : path.resolve(getMalaguHomePath(), 'runtimes');
            return path.resolve(basePath, RuntimeUtil.getVersion(), runtime);
        }
        return process.cwd();
    }

    export function getRuntimeRootPath(version?: string) {
        const basePath = process.env.MALAGU_RUNTIME_PATH ? process.env.MALAGU_RUNTIME_PATH : path.resolve(getMalaguHomePath(), 'runtimes');
        return version ? path.resolve(basePath, RuntimeUtil.getVersion()) : basePath;
    }

    export function getCurrentRuntimeRootPath() {
        return getRuntimeRootPath(RuntimeUtil.getVersion());
    }
}
