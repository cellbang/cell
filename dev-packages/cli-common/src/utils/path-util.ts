import { ApplicationPackage } from '../package';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import * as path from 'path';
import { homedir } from 'os';

export namespace PathUtil {
    export function getProjectHomePathForTarget(target: string, runtime?: string) {
        return path.join(getProjectHomePath(runtime), target);
    }

    export function getBackendProjectHomePath(pkg: ApplicationPackage, runtime?: string) {
        return getProjectHomePathForTarget(BACKEND_TARGET, runtime);
    }

    export function getFrontendProjectHomePath(pkg: ApplicationPackage, runtime?: string) {
        return getProjectHomePathForTarget(FRONTEND_TARGET, runtime);
    }

    export function getProjectHomePath(runtime?: string) {
        return process.env.MALAGU_PROJECT_HOME_PATH ? process.env.MALAGU_PROJECT_HOME_PATH : path.join(getRuntimePath(runtime), '.malagu');
    }

    export function setProjectHomePath(projectHomePath: string) {
        process.env.MALAGU_PROJECT_HOME_PATH = projectHomePath;
    }

    export function getMalaguHomePath() {
        return process.env.MALAGU_HOME_PATH ? process.env.MALAGU_HOME_PATH : path.join(homedir(), '.malagu');
    }

    export function getRuntimePath(runtime?: string) {
        return runtime ? path.join(getMalaguHomePath(), 'runtimes', runtime) : process.cwd();
    }
}
