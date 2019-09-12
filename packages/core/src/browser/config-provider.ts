import { ConfigProvider, CONFIG } from '../common/config-provider';
import { Component } from '../common/annotation';
const jexl = require('jexl');

@Component(ConfigProvider)
export class ConfigProviderImpl implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        const globelObj = window as any;
        return jexl.evalSync(key, globelObj[CONFIG]) || defaultValue;
    }

}
