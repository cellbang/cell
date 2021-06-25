import { Autowired, Component, Value } from '@malagu/core';
import { CronJob } from 'cron';
import { SchedulerRegistry, CronJobOptions } from './registry-protocol';
import { DuplicateSchedulerError, NoSchedulerFoundError } from '../error';
import { CronJobFactory } from '../factory';

@Component(SchedulerRegistry)
export class DefaultSchedulerRegistry implements SchedulerRegistry {

    @Value('malagu.schedule.defaultCronJobOptions')
    protected readonly defaultCronJobOptions: Partial<CronJobOptions>;

    @Autowired(CronJobFactory)
    protected readonly cronJobFactory: CronJobFactory;

    protected readonly cronJobs = new Map<string, CronJob>();

    get(name: string): CronJob {
        const job = this.cronJobs.get(name);
        if (!job) {
            throw new NoSchedulerFoundError(name);
        }
        return job;
    }

    getAll(): Map<string, CronJob> {
        return this.cronJobs;
    }

    add(name: string, options: CronJobOptions): CronJob {
        let job = this.cronJobs.get(name);
        if (job) {
            throw new DuplicateSchedulerError(name);
        }
        job = this.cronJobFactory.create(options);
        this.cronJobs.set(name, job);
        return job;
    }

    delete(name: string): void {
        const job = this.get(name);
        job.stop();
        this.cronJobs.delete(name);
    }

    has(name: string): boolean {
        return this.cronJobs.has(name);
    }

}
