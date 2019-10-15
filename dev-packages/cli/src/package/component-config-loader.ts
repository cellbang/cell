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
        let configPath: string | undefined = undefined;
        try {
            if (this.pkg.isRoot(nodePackage)) {
                if (existsSync(this.pkg.path(CONFIG_FILE))) {
                    configPath = this.pkg.path(CONFIG_FILE);
                }

            } else {
                configPath = this.pkg.resolveModule(nodePackage.name + `/${CONFIG_FILE}`);
            }

        } catch (err) {
            // noop
        }
        if (configPath) {
            config = { ...config, ...yaml.safeLoad(readFileSync(configPath, { encoding: 'utf8' })) };
        }

        if (mode) {
            mode = config.mode;
        }

        if (mode) {

            let configPathForMode: string | undefined = undefined;

            try {
                configPathForMode = this.pkg.resolveModule(name + `/malagu-${mode}.yml`);

            } catch (err) {
                // noop
            }
            if (configPathForMode) {
                const configForMode = yaml.safeLoad(readFileSync(configPathForMode, { encoding: 'utf8' }));
                config = mergeWith(config, configForMode, customizer);
            }
        }
        nodePackage.malaguComponent = config;
    }
}
