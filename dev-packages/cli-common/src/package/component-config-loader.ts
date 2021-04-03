import { ApplicationPackage } from './application-package';
import { customizer } from './package-protocol';
import { load } from 'js-yaml';
import { CONFIG_FILE } from '../constants';
import { readFileSync, existsSync } from 'fs';
import { NodePackage } from './npm-registry';
import { mergeWith } from 'lodash';

export class ComponentPackageLoader {
    constructor(protected readonly pkg: ApplicationPackage) {

    }

    load(nodePackage: NodePackage, mode: string[]): void {
        let config: any = {};
        const configMap = new Map<string, any>();
        config = this.doLoad(nodePackage, [ ''/* load default config file */, ...mode ], configMap, config);
        configMap.delete('');
        config.mode = Array.from(configMap.keys());
        nodePackage.malaguComponent = config;
    }

    doLoad(nodePackage: NodePackage, mode: string[], configMap: Map<string, any>,  config: any): any {

        for (let i = 0; i < mode.length; i++) {
            const m = mode[i];
            const configForMode = this.loadConfig(nodePackage, m);
            configMap.set(m, configForMode || {});
            if (configForMode) {
                config = mergeWith(config, configForMode, customizer);
                const modeForConfig = this.getMode(configForMode);
                const diffMode = this.diffMode(modeForConfig, configMap);
                if (diffMode.length > 0) {
                    if (i < mode.length - 1) {
                        mode.splice(0, i + 1);
                    } else {
                        mode = [];
                    }
                    return this.doLoad(nodePackage, this.mergeMode(diffMode, mode), configMap, config);
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

    protected getMode(config: any) {
        return Array.isArray(config.mode) ? config.mode : config.mode ? [config.mode] : [];
    }

    loadConfig(nodePackage: NodePackage, mode?: string) {
        const configPath = mode ? `malagu-${mode}.yml` : CONFIG_FILE;
        let fullConfigPath: string | undefined = undefined;

        try {
            if (this.pkg.isRoot(nodePackage)) {
                if (existsSync(this.pkg.path(configPath))) {
                    fullConfigPath = this.pkg.path(configPath);
                }

            } else {
                fullConfigPath = this.pkg.resolveModule(nodePackage.name + `/${configPath}`);
            }

        } catch (err) {
            // noop
        }
        if (fullConfigPath) {
            return load(readFileSync(fullConfigPath, { encoding: 'utf8' }));
        }
    }
}
