import { ConfigProvider, CONFIG } from '../common/config-provider';
import { injectable } from 'inversify';
const jexl = require('jexl');

@injectable()
export class ConfigProviderImpl implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        const globelObj = window as any;
        return jexl.evalSync(key, globelObj[CONFIG]) || defaultValue;
    }

}
