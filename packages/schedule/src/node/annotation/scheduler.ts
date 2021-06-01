import { METADATA_KEY } from '../constants';
import { CronJobOptions } from '../registry/registry-protocol';
import { Component, ComponentId, ComponentOption, parseComponentOption } from '@malagu/core';

export const SCHEDULER = Symbol('Scheduler');

export const SCHEDULER_TAG = 'Scheduler';

export interface SchedulerMetadata extends Partial<CronJobOptions> {
}

export function Scheduler(cronJobOptions?: CronJobOptions, componentOptions?: ComponentOption): ClassDecorator {
    return function (target) {
        const option = parseCornJobOptionOption(target, componentOptions);
        applySchedulerDecorator(target, option, cronJobOptions);
    };
}

export function parseCornJobOptionOption(target: any, componentOption?: ComponentOption) {
    const parsed = <ComponentOption>parseComponentOption(target, componentOption);
    parsed.sysTags!.push(SCHEDULER_TAG);
    (parsed.id as Array<ComponentId>).push(SCHEDULER);
    return parsed;
}

export function applySchedulerDecorator(target: any, componentOptions: ComponentOption, cronJobOptions?: CronJobOptions) {
    const metadata: SchedulerMetadata = { ...cronJobOptions };
    Reflect.defineMetadata(METADATA_KEY.scheduler, metadata, target);
    Component(componentOptions)(target);
    return metadata;
}
