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
    @Value('malagu.typeorm')
    protected readonly options: any;
    @Value('malagu.casbin.dataSource')
    protected readonly dataSource: string;
    async onStart(app: Application) {
        const { ormConfig } = this.options;
        let config: any;
        if (Array.isArray(ormConfig)) {
            ormConfig.map(item => {
                if (item.name === 'Casbin') {
                    config = item;
                }
            });
        } else {
            if (ormConfig.name === 'Casbin') {
                config = ormConfig;
            }
        }
        if (!config) {
            throw new Error('Casbin dataSource not found');
        }
        await createEnforcer(config, this.dataSource);
    }

    onStop(app: Application) {}
}
