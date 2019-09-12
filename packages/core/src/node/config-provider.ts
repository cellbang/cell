import { ConfigProvider } from '../common/config-provider';
import { Component } from '../common/annotation';
const jexl = require('jexl');

@Component(ConfigProvider)
export class ConfigProviderImpl implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        return jexl.evalSync(key, process.env) || defaultValue;
    }

}
