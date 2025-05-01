import { Component, Props, ApplicationLog, ApplicationConfigOptions } from './package-protocol';
import { FRONTEND_TARGET, BACKEND_TARGET, CONFIG_FILE } from '../constants';
import { existsSync, readFileSync, readJSONSync } from 'fs-extra';
import { load } from 'js-yaml';
const cloneDeep = require('lodash.clonedeep');
import { ApplicationPackage } from './application-package';
import { ConfigUtil } from '../utils/config-util';
import * as path from 'path';
import { ComponentUtil } from '../utils/component-util';

// tslint:disable:no-implicit-dependencies

// tslint:disable-next-line:no-any

export class ApplicationConfig {
    readonly log: ApplicationLog;
    readonly error: ApplicationLog;

    constructor(
        protected readonly options: ApplicationConfigOptions,
        readonly pkg: ApplicationPackage

    ) {
        this.log = this.pkg.log;
        this.error = this.pkg.error;
    }

    protected _props: Component | undefined;
    get props(): Component {
        if (this._props) {
            return this._props;
        }
        let props = <Component>{ cell: {} };
        for (const componentPackage of this.pkg.componentPackages) {
            const component = componentPackage.cellComponent;
            if (component) {
                props = ConfigUtil.merge(props, component);
            }
        }

        if (this.pkg.framework) {
            const settings = this.pkg.framework.settings || {};
            props = ConfigUtil.merge(settings, props);
        }

        return props;
    }

    protected _rootConfig: Props | undefined;
    get rootConfig(): Props {
        if (this._rootConfig) {
            return this._rootConfig;
        }
        if (existsSync(this.pkg.path(process.cwd(), CONFIG_FILE))) {
            this._rootConfig = load(readFileSync(this.pkg.path(process.cwd(), CONFIG_FILE), { encoding: 'utf8' })) as any;
        }
        if (this._rootConfig && !this._rootConfig.cell) {
            this._rootConfig.cell = {};
        }
        return this._rootConfig || { cell: {} };
    }

    getConfig(target: string): Props {
        /* eslint-disable-next-line @typescript-eslint/no-this-alias */
        const self: any = this;
        const configProperty = `_${target}Config`;
        if (self[configProperty]) {
            return self[configProperty];
        }
        let config: any = cloneDeep(this.props);
        delete config.backend;
        delete config.frontend;
        config = ConfigUtil.merge(config, this.props[target]);
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        if (existsSync(packageJsonPath)) {
            const packageJson = readJSONSync(packageJsonPath);
            const keywords = packageJson.keywords;
            const alias = ComponentUtil.getComponentAlias(keywords)[0];
            if (alias !== 'cell') {
                config.cell = ConfigUtil.merge(config.cell, config[alias]);
            }
        }

        delete config.webpackHooks;
        delete config.initHooks;
        delete config.configHooks;
        delete config.compileHooks;
        delete config.buildHooks;
        delete config.deployHooks;
        delete config.serveHooks;
        delete config.cliHooks;
        delete config.modules;
        delete config.staticModules;
        delete config.assets;
        delete config.configFiles;

        config.targets = this.options.targets.length ? this.options.targets : (config.targets || [ FRONTEND_TARGET, BACKEND_TARGET ]);
        config.targets = Array.from(new Set(config.targets));
        self[configProperty] = config;
        return config;
    }

    protected _frontendConfig: Props | undefined;
    get frontendConfig(): Props {
        return this.getConfig(FRONTEND_TARGET);
    }

    protected _backendConfig: Props | undefined;
    get backendConfig(): Props {
        return this.getConfig(BACKEND_TARGET);
    }

}
