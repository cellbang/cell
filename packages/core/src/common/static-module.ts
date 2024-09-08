import './index';
import { bindValue } from './annotation/value';
import { bindAutowiredProvider } from './annotation/autowired-provider';
import { autoBind } from './container/auto-bind';

export default autoBind(bind => {
    bindValue(bind);
    bindAutowiredProvider(bind);
});
