import { container } from '@celljs/core/lib/common/container/dynamic-container';
import { Application } from '@celljs/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@celljs/core/lib/common/container/container-provider';
import { Clock } from '@celljs/faas-adapter/lib/node/timer/timer-protocol';
import { FaaSEventListener } from '@celljs/faas-adapter/lib/node/event/event-protocol';

let clock: Clock;
let listeners: FaaSEventListener<any, void>[];

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    clock = c.get<Clock>(Clock);
    listeners = c.getAll<FaaSEventListener<any, void>>(FaaSEventListener);
}

const startPromise = start();

export async function handler(event: string, context: any, callback: any) {
    process.env.ALIBABA_ACCOUNT_ID = context.accountId;
    process.env.ALIBABA_ACCESS_KEY_ID = context.credentials?.accessKeyId;
    process.env.ALIBABA_ACCESS_KEY_SECRET = context.credentials?.accessKeySecret;
    process.env.ALIBABA_SECURITY_TOKEN = context.credentials?.securityToken;
    process.env.ALIBABA_REQUEST_ID = context.requestId;
    process.env.ALIBABA_REGION = context.region;
    try {
        await startPromise;
        await Promise.all(listeners.map(l => l.onTrigger(event)));
        await clock.tick();
        callback();
    } catch (error) {
        callback(undefined, error);
    }

}
