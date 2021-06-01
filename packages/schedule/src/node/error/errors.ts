import { CustomError } from '@malagu/core';

export class SchedulerError extends CustomError {

}

export class NoSchedulerFoundError extends SchedulerError {

    constructor(name: string) {
        super(`No Cron Job was found with the given name (${name}). Check that you created one with a decorator or with the create API.`);
    }

}

export class DuplicateSchedulerError extends SchedulerError {

    constructor(name: string) {
        super(`Cron Job with the given name (${name}) already exists. Ignored.`);
    }

}
