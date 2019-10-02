import { ConfigProvider } from './config-protocol';
import { Component } from '../annotation';
const jexl = require('jexl');

@Component(ConfigProvider)
export class ConfigProviderImpl implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        return jexl.evalSync(key, process.env.MALAGU_CONFIG) || defaultValue;
    }

}
