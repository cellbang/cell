import { Component, Props, ApplicationLog, customizer, ApplicationConfigOptions } from './package-protocol';
import mergeWith = require('lodash.mergewith');
import { FRONTEND_TARGET, BACKEND_TARGET, CONFIG_FILE } from '../constants';
import { existsSync, readFileSync } from 'fs-extra';
import yaml = require('js-yaml');
import { ApplicationPackage } from './application-package';

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
        let props = <Component>{ malagu: {} };
        for (const componentPackage of this.pkg.componentPackages) {
            const component = componentPackage.malaguComponent;
            if (component) {
                props = mergeWith(props, component, customizer);
            }
        }

        return props;
    }

    protected _rootConfig: Props | undefined;
    get rootConfig(): Props {
        if (this._rootConfig) {
            return this._rootConfig;
        }
        if (existsSync(this.pkg.path(CONFIG_FILE))) {
            this._rootConfig = yaml.load(readFileSync(this.pkg.path(CONFIG_FILE), { encoding: 'utf8' }));
        }
        if (this._rootConfig && !this._rootConfig.malagu) {
            this._rootConfig.malagu = {};
        }
        return this._rootConfig || { malagu: {} };
    }

    getConfig(target: string): Props {
        const self: any = this;
        const configProperty = `_${target}Config`;
        if (self[configProperty]) {
            return self[configProperty];
        }
        let config: any = { ...this.props };
        delete config.backend;
        delete config.frontend;
        config = mergeWith(config, this.props[target], customizer);

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
