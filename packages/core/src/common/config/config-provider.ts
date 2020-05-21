import { ConfigProvider } from './config-protocol';
import { Component } from '../annotation';
import { render, parse } from 'mustache';

const jexl = require('jexl');

@Component(ConfigProvider)
export class ConfigProviderImpl implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        const config: any = process.env.MALAGU_CONFIG;
        const value = jexl.evalSync(key, config) || defaultValue;
        if (typeof value === 'string') {
            config.env = process.env;
            parse(value);
            return render(value, config) as any;
        }
        return value;
    }

}
