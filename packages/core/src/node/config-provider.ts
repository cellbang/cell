import { ConfigProvider } from '../common/config-provider';
import { injectable } from 'inversify';
const jexl = require('jexl');

@injectable()
export class ConfigProviderImpl implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        return jexl.evalSync(key, process.env) || defaultValue;
    }

}
