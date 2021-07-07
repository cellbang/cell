import { Disposable } from '@malagu/core';
import { CronJob, CronTime } from 'cron';
import { CronJobOptions } from '@malagu/schedule';
import { Clock } from './timer-protocol';

export class FaaSCronJob extends CronJob {

    protected tickDisposable?: Disposable;

    constructor(protected readonly clock: Clock, options: CronJobOptions) {
        super(options);
    }

    protected async fireOnTickAsync() {
        const callbacks = (this as any)._callbacks;
        const context = (this as any).context;
        const onComplete = (this as any).onComplete;
        await Promise.all(callbacks.map((callback: any) => callback.call(context, onComplete)));
    };

    start() {
        if (this.running) {
            return;
        }

        this.tickDisposable = this.clock.onTick(async () => {

            const cronTime: CronTime = (this as any).cronTime;
            const timeout = cronTime.getTimeout();
            if (timeout <= 60 * 1000) {
                await this.fireOnTickAsync();
            }

        });
    }

    stop() {
        this.tickDisposable?.dispose();
        this.running = false;
        const onComplete = (this as any).onComplete;
        if (typeof onComplete === 'function') {
            onComplete();
        }
    }

}
