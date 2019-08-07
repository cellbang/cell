import { ConfigProvider } from '../common/config-provider';
import { injectable } from 'inversify';

@injectable()
export class ConfigProviderImpl implements ConfigProvider {
    get<T>(key: string, defaultValue?: T): T {
        const value = process.env[key] as any;
        return value || defaultValue;
    }

}
