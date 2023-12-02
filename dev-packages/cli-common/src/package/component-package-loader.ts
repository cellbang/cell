import { ApplicationPackage } from './application-package';
import { load } from 'js-yaml';
import { readFileSync, existsSync } from 'fs-extra';
import { NodePackage } from './npm-registry';
import { join } from 'path';
import { ConfigUtil } from '../utils/config-util';
import { ExpressionHandlerFactory } from '../el/expression-handler-factory';
import { MALAGU_COMPONENT_SUFFIX } from './package-protocol';

export class ComponentPackageLoader {
    constructor(protected readonly pkg: ApplicationPackage) {

    }

    load(nodePackage: NodePackage, mode: string[]): void {
        let config: any = {};
        const configMap = new Map<string, any>();
        const configFiles: string[] = [];
        config = this.doLoad(nodePackage, [ ''/* load default config file */, ...mode ], configMap, config, configFiles);
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
                config = ConfigUtil.merge(config, configForMode);
                const modeForConfig = this.getMode(configForMode, mode);
                const diffMode = this.diffMode(modeForConfig, configMap);
                if (diffMode.length > 0) {
                    return this.doLoad(nodePackage, this.mergeMode(mode, diffMode), configMap, config, configFiles);
                }
            }
        }
        config.mode = mode.filter(m => !!m);
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
        const expressionHandler = new ExpressionHandlerFactory().create(config);
        const ctx = { ...config, currentMode: mode };
        return newMode.map(m => expressionHandler.evalSync(m, ctx));
    }

    protected parseConfigPaths(nodePackage: NodePackage, mode?: string): string[] {
        const keywords = nodePackage.keywords ?? [];
        const keywordsAlias = keywords
            .filter(k => k.endsWith(MALAGU_COMPONENT_SUFFIX))
            .map(k => k.substring(0, k.length - MALAGU_COMPONENT_SUFFIX.length));
        const configFileAliases = [ 'malagu', ...keywordsAlias ];
        const configFileAlias = process.env.MALAGU_CONFIG_FILE_ALIAS || this.pkg.settings?.configFileAlias;
        if (configFileAlias) {
            configFileAliases.push(configFileAlias);
        }
        const paths: string[] = [];
        for (const alias of configFileAliases) {
            if (mode) {
                paths.push(`${alias}.${mode}.yml`);
                paths.push(`${alias}.${mode}.yaml`);
                paths.push(`${alias}-${mode}.yml`);
                paths.push(`${alias}-${mode}.yaml`);
            } else {
                paths.push(`${alias}.yml`);
                paths.push(`${alias}.yaml`);
            }
        }
        return paths;
    }

    loadConfig(nodePackage: NodePackage, configFiles: string[], mode?: string) {
        const configPaths = this.parseConfigPaths(nodePackage, mode);
        let fullConfigPath: string | undefined = undefined;
        for (const configPath of configPaths) {
            try {
                if (this.pkg.isRoot(nodePackage)) {
                    if (existsSync(join(nodePackage.modulePath, configPath))) {
                        fullConfigPath = join(nodePackage.modulePath, configPath);
                    }
                } else {
                    fullConfigPath = this.pkg.resolveModule(nodePackage.name + `/${configPath}`);
                }
                if (fullConfigPath) {
                    break;
                }
            } catch (err) {
                // noop
            }
        }
        if (fullConfigPath) {
            configFiles.push(fullConfigPath);
            return load(readFileSync(fullConfigPath, { encoding: 'utf8' }));
        }
    }
}
