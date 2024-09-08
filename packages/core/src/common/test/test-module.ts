import { bindAutowiredProvider } from '../annotation/autowired-provider';
import { bindValue } from '../annotation/value';
import { autoBind } from '../container';
import { Logger } from '../logger';
import { MockLogger } from './mock-logger';
import '../index';

export const coreTestModule = autoBind((bind, unbind, isBound, rebind) => {
    bindValue(bind);
    bindAutowiredProvider(bind);
    rebind(Logger).to(MockLogger).inSingletonScope();
});
