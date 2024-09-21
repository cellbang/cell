import { ApplicationPackage } from '../package/application-package';
import { ApplicationConfig } from '../package/application-config';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { Module } from '../package/package-protocol';
import mergeWith = require('lodash.mergewith');

export namespace ConfigUtil {
    export function getWebpackConfig(cfg: ApplicationConfig, target: string) {
        return getCellConfig(cfg, target).webpack || {};

    }

    export function getFrontendWebpackConfig(cfg: ApplicationConfig) {
        return getWebpackConfig(cfg, FRONTEND_TARGET);
    }

    export function getBackendWebpackConfig(cfg: ApplicationConfig) {
        return getWebpackConfig(cfg, BACKEND_TARGET);
    }

    export function getCellConfig(cfg: ApplicationConfig, target: string) {
        return getConfig(cfg, target).cell || {};
    }

    export function getFrontendCellConfig(cfg: ApplicationConfig) {
        return getCellConfig(cfg, FRONTEND_TARGET);
    }

    export function getBackendCellConfig(cfg: ApplicationConfig) {
        return getCellConfig(cfg, BACKEND_TARGET);
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
        const targets = cfg.getConfig(target).targets || [];
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
        const server = getCellConfig(cfg, target).server || { port: 3000 };
        return server.port;
    }

    export function merge(...objects: any[]) {
        const customizer = (objValue: any, srcValue: any) => {
            if (Array.isArray(objValue)) {
                return srcValue;
            }
        };
        const last = objects[objects.length - 1];
        const [first, ...rest] = objects;
        return mergeWith(first, ...rest, typeof last === 'function' ? last : customizer);
    }
}
