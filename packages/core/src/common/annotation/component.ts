import { fluentProvide } from 'inversify-binding-decorators';
import { interfaces }from 'inversify';
export const component = (serviceIdentifier: interfaces.ServiceIdentifier<any>, isSingletonScope: boolean = true) => {
    const p = fluentProvide(serviceIdentifier);
    if (isSingletonScope) {
        p.inSingletonScope();
    }
    return p.done(true);
};
