import { ApplicationPackage } from './application-package';
import { customizer } from './package-protocol';
import { load } from 'js-yaml';
import { CONFIG_FILE } from '../constants';
import { readFileSync, existsSync } from 'fs';
import { NodePackage } from './npm-registry';
import mergeWith = require('lodash.mergewith');
import { ExpressionHandler } from '../el';
import { join } from 'path';

export class ComponentPackageLoader {
    constructor(protected readonly pkg: ApplicationPackage) {

    }

    load(nodePackage: NodePackage, mode: string[]): void {
        let config: any = {};
        const configMap = new Map<string, any>();
        const configFiles: string[] = [];
        config = this.doLoad(nodePackage, [ ''/* load default config file */, ...mode ], configMap, config, configFiles);
        configMap.delete('');
        config.mode = Array.from(configMap.keys());
        config.configFiles = configFiles;
        nodePackage.malaguComponent = config;
    }

    doLoad(nodePackage: NodePackage, mode: string[], configMap: Map<string, any>,  config: any, configFiles: string[]): any {

        for (let i = 0; i < mode.length; i++) {
            const m = mode[i];
            if (configMap.has(m)) {
                continue;
            }
            const configForMode = this.loadConfig(nodePackage, configFiles, m);
            configMap.set(m, configForMode || {});
            if (configForMode) {
                config = mergeWith(config, configForMode, customizer);
                const modeForConfig = this.getMode(configForMode, mode);
                const diffMode = this.diffMode(modeForConfig, configMap);
                if (diffMode.length > 0) {
                    return this.doLoad(nodePackage, this.mergeMode(diffMode, mode), configMap, config, configFiles);
                }
            }
        }
        return config;
    }

    protected mergeMode(mode1: string[], mode2: string[]) {
        return Array.from(new Set<string>([...mode1, ...mode2]));
    }

    protected diffMode(mode: string[], configMap: Map<string, any>) {
        const result: string[] = [];
        for (const m of mode) {
            if (!configMap.get(m)) {
                result.push(m);
            }
        }
        return result;
    }

    protected getMode(config: any, mode: string[]) {
        const newMode: string[] = Array.isArray(config.mode) ? config.mode : config.mode ? [config.mode] : [];
        const expressionHandler = new ExpressionHandler();
        const ctx = { ...config, currentMode: mode };
        return newMode.map(m => expressionHandler.evalSync(m, ctx));
    }

    loadConfig(nodePackage: NodePackage, configFiles: string[], mode?: string) {
        const configPath = mode ? `malagu-${mode}.yml` : CONFIG_FILE;
        let fullConfigPath: string | undefined = undefined;

        try {
            if (this.pkg.isRoot(nodePackage)) {
                if (existsSync(join(nodePackage.modulePath, configPath))) {
                    fullConfigPath = join(nodePackage.modulePath, configPath);
                }
            } else {
                fullConfigPath = this.pkg.resolveModule(nodePackage.name + `/${configPath}`);
            }

        } catch (err) {
            // noop
        }
        if (fullConfigPath) {
            configFiles.push(fullConfigPath);
            return load(readFileSync(fullConfigPath, { encoding: 'utf8' }));
        }
    }
}
