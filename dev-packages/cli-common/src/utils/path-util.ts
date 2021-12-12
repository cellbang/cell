import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import * as path from 'path';
import { homedir } from 'os';
import { v5 } from 'uuid';
import { RuntimeUtil } from './runtime-util';

export namespace PathUtil {
    export function getProjectDistPathForTarget(target: string, runtime?: string) {
        return path.join(getProjectDistPath(runtime), target);
    }

    export function getProjectDistPath(runtime?: string) {
        if (process.env.MALAGU_PROJECT_DIST_PATH) {
            return path.resolve(process.cwd(), process.env.MALAGU_PROJECT_DIST_PATH);
        }
        if (runtime) {
            return path.join(getProjectDistParentPath(runtime), v5(process.cwd(), v5.URL));
        }
        return path.join(getProjectHomePath(runtime), 'dist');
    }

    export function getProjectDistParentPath(runtime: string) {
        return path.join(getProjectHomePath(runtime), 'dist');
    }

    export function getBackendProjectDistPath(runtime?: string) {
        return getProjectDistPathForTarget(BACKEND_TARGET, runtime);
    }

    export function getFrontendProjectDistPath(runtime?: string) {
        return getProjectDistPathForTarget(FRONTEND_TARGET, runtime);
    }
    export function getProjectHomePathForTarget(target: string, runtime?: string) {
        return path.join(getProjectHomePath(runtime), target);
    }

    export function getBackendProjectHomePath(runtime?: string) {
        return getProjectHomePathForTarget(BACKEND_TARGET, runtime);
    }

    export function getFrontendProjectHomePath(runtime?: string) {
        return getProjectHomePathForTarget(FRONTEND_TARGET, runtime);
    }

    export function getProjectHomePath(runtime?: string) {
        return process.env.MALAGU_PROJECT_HOME_PATH ? path.resolve(process.cwd(), process.env.MALAGU_PROJECT_HOME_PATH) : path.join(getRuntimePath(runtime), '.malagu');
    }

    export function setProjectHomePath(projectHomePath: string) {
        process.env.MALAGU_PROJECT_HOME_PATH = projectHomePath;
    }

    export function getMalaguHomePath() {
        return process.env.MALAGU_HOME_PATH ? process.env.MALAGU_HOME_PATH : path.join(homedir(), '.malagu');
    }

    export function getRuntimePath(runtime?: string) {
        if (runtime) {
            const basePath = process.env.MALAGU_RUNTIME_PATH ? process.env.MALAGU_RUNTIME_PATH : path.join(getMalaguHomePath(), 'runtimes');
            return path.join(basePath, RuntimeUtil.getVersion(), runtime);
        }
        return process.cwd();
    }

    export function getRuntimeRootPath(version?: string) {
        const basePath = process.env.MALAGU_RUNTIME_PATH ? process.env.MALAGU_RUNTIME_PATH : path.join(getMalaguHomePath(), 'runtimes');
        return version ? path.join(basePath, RuntimeUtil.getVersion()) : basePath;
    }

    export function getCurrentRuntimeRootPath() {
        return getRuntimeRootPath(RuntimeUtil.getVersion());
    }
}
