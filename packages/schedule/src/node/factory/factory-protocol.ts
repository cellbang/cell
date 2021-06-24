import { CronJob } from 'cron';
import { CronJobOptions } from '../registry';
export const CronJobFactory = Symbol('CronJobFactory');

export interface CronJobFactory {
    create(options: CronJobOptions): CronJob;
}
