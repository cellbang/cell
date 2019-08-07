import { ConfigProvider, CONFIG } from '../common/config-provider';
import { injectable } from 'inversify';

@injectable()
export class ConfigProviderImpl implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        const globelObj = window as any;
        const value = globelObj[CONFIG][key] as any;
        return value || defaultValue;
    }

}
