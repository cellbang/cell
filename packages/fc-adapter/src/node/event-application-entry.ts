import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { FaaSEventListener } from '@malagu/faas-adapter/lib/node/event/event-protocol';

let listeners: FaaSEventListener<any>[];

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    listeners = c.getAll<FaaSEventListener<any>>(FaaSEventListener);
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
        callback();
    } catch (error) {
        callback(undefined, error);
    }

}
