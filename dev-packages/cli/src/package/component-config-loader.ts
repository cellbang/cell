import { ApplicationPackage } from './application-package';
import { customizer } from './package-protocol';
import yaml = require('js-yaml');
import { CONFIG_FILE } from '../constants';
import { readFileSync, existsSync } from 'fs';
import { NodePackage } from './npm-registry';
import { mergeWith } from 'lodash';

export class ComponentPackageLoader {
    constructor(protected readonly pkg: ApplicationPackage) {

    }

    load(nodePackage: NodePackage, mode?: string) {
        let config: any = {};
        config = this.loadConfig(nodePackage);

        if (!mode && config) {
            mode = config.mode;
        }

        if (mode) {

            const configForMode = this.loadConfig(nodePackage, mode);

            if (configForMode) {
                config = mergeWith(config, configForMode, customizer);
            }
        }
        nodePackage.malaguComponent = config;
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
            return yaml.safeLoad(readFileSync(fullConfigPath, { encoding: 'utf8' }));
        }
    }
}
