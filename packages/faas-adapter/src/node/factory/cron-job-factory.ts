import { Autowired, Component, Value } from '@malagu/core';
import { CronJob } from 'cron';
import { CronJobFactory, CronJobOptions, DefaultCronJobFactory } from '@malagu/schedule';
import { Clock, FaaSCronJob } from '../timer';

@Component({ id: CronJobFactory, rebind: true })
export class FaaSCronJobFactory extends DefaultCronJobFactory {

    @Autowired(Clock)
    protected readonly clock: Clock;

    @Value('mode')
    protected readonly mode: string[];

    override create(options: CronJobOptions): CronJob {
        if (this.mode.includes('remote')) {
            return new FaaSCronJob(this.clock, {...this.defaultCronJobOptions, ...options });
        } else {
            return super.create(options);
        }
    }

}
