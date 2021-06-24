import { Component, Value } from '@malagu/core';
import { CronJob } from 'cron';
import { CronJobFactory } from './factory-protocol';
import { CronJobOptions } from '../registry';

@Component(CronJobFactory)
export class DefaultCronJobFactory implements CronJobFactory {

    @Value('malagu.schedule.defaultCronJobOptions')
    protected readonly defaultCronJobOptions: Partial<CronJobOptions>;

    create(options: CronJobOptions): CronJob {
        return new CronJob({...this.defaultCronJobOptions, ...options });
    }

}
