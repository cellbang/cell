import { ConfigProvider } from './config-protocol';
import { Component, Autowired } from '../annotation';
import { ExpressionHandler } from '../el';

@Component(ConfigProvider)
export class ConfigProviderImpl implements ConfigProvider {

    @Autowired(ExpressionHandler)
    protected readonly expressionHandler: ExpressionHandler;

    get<T>(key: string, defaultValue?: T): T {

        return this.expressionHandler.handle(`\${${key}}`) || defaultValue;
    }

}
