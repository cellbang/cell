import { CronJobParameters, CronJob } from 'cron';
export const SchedulerRegistry = Symbol('SchedulerRegistry');

export interface CronJobOptions extends CronJobParameters {

}

export interface SchedulerRegistry {
    get(name: string): CronJob;
    getAll(): Map<string, CronJob>;
    add(name: string, options: CronJobOptions): CronJob;
    delete(name: string): void;
    has(name: string): boolean;
}
