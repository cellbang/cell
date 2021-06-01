import { METADATA_KEY } from '../constants';
import { CronJobOptions } from '../registry';

export type CronOptions = Omit<CronJobOptions, 'onTick' | 'cronTime'> & { name?: string };

export interface CronMetadata extends CronOptions {
    cronTime: string | Date;
    method: string | symbol;
}

export function Cron(cronTime: string | Date, options?: CronOptions): MethodDecorator {
    return (t, k, d) => {
        applyCronDecorator(t, k, d, cronTime, options);
    };
}

export function applyCronDecorator(target: any, targetKey: string | symbol, descriptor: TypedPropertyDescriptor<any>, cronTime: string | Date, options?: CronOptions): void {
    const metadatas: CronMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.cron, target.constructor) || [];
    metadatas.push({ ...options, cronTime, method: targetKey });
    Reflect.defineMetadata(METADATA_KEY.cron, metadatas, target.constructor);
}
