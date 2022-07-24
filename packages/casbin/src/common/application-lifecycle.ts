import {
    Component,
    ApplicationLifecycle,
    Application,
    Value,
} from '@malagu/core';
import { createEnforcer } from './utils';

@Component(ApplicationLifecycle)
export class TypeOrmCasbinApplicationLifecycle
    implements ApplicationLifecycle<Application> {
    @Value('malagu.casbin')
    protected readonly options: any;
    async onStart(app: Application) {
        await createEnforcer(this.options);
    }

    onStop(app: Application) {}
}
