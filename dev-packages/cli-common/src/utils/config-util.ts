import { ApplicationPackage, ApplicationConfig } from '../package';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { Module } from '../package';

export namespace ConfigUtil {
    export function getWebpackConfig(cfg: ApplicationConfig, target: string) {
        return getMalaguConfig(cfg, target).webpack || {};

    }

    export function getFrontendWebpackConfig(cfg: ApplicationConfig) {
        return getWebpackConfig(cfg, FRONTEND_TARGET);
    }

    export function getBackendWebpackConfig(cfg: ApplicationConfig) {
        return getWebpackConfig(cfg, BACKEND_TARGET);
    }

    export function getMalaguConfig(cfg: ApplicationConfig, target: string) {
        return getConfig(cfg, target).malagu || {};
    }

    export function getFrontendMalaguConfig(cfg: ApplicationConfig) {
        return getMalaguConfig(cfg, FRONTEND_TARGET);
    }

    export function getBackendMalaguConfig(cfg: ApplicationConfig) {
        return getMalaguConfig(cfg, BACKEND_TARGET);
    }

    export function getConfig(cfg: ApplicationConfig, target: string) {
        return cfg.getConfig(target) || {};
    }

    export function getFrontendConfig(cfg: ApplicationConfig) {
        return cfg.getConfig(FRONTEND_TARGET);
    }

    export function getBackendConfig(cfg: ApplicationConfig) {
        return cfg.getConfig(BACKEND_TARGET);
    }

    export function getAssets(pkg: ApplicationPackage, target: string): Module[] {
        return (pkg as any)[`${target}Assets`];
    }

    export function getFrontendAssets(pkg: ApplicationPackage): Module[] {
        return getAssets(pkg, FRONTEND_TARGET);
    }

    export function getBackendAssets(pkg: ApplicationPackage): Module[] {
        return getAssets(pkg, BACKEND_TARGET);
    }

    export function getModules(pkg: ApplicationPackage, target: string): Module[] {
        return (pkg as any)[`${target}Modules`];
    }

    export function getFrontendModules(pkg: ApplicationPackage): Module[] {
        return getModules(pkg, FRONTEND_TARGET);
    }

    export function getBackendModules(pkg: ApplicationPackage): Module[] {
        return getModules(pkg, BACKEND_TARGET);
    }

    export function support(cfg: ApplicationConfig, target: string) {
        const targets = cfg.getConfig(target).targets || [FRONTEND_TARGET, BACKEND_TARGET];
        return targets.includes(target);
    }

    export function supportBackend(cfg: ApplicationConfig) {
        return support(cfg, BACKEND_TARGET);
    }

    export function supportFrontend(cfg: ApplicationConfig) {
        return support(cfg, FRONTEND_TARGET);
    }

    export function getPort(cfg: ApplicationConfig, target: string, port?: number) {
        if (port !== undefined) {
            return port;
        }
        const server = getMalaguConfig(cfg, target).server || { port: 3000 };
        return server.port;
    }
}
