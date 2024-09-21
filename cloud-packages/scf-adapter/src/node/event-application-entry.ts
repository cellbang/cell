import { container } from '@celljs/core/lib/common/container/dynamic-container';
import { Application } from '@celljs/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@celljs/core/lib/common/container/container-provider';
import { FaaSEventListener } from '@celljs/faas-adapter/lib/node/event/event-protocol';
import { FaaSUtils } from '@celljs/faas-adapter/lib/node/utils';

let listeners: FaaSEventListener<any, any>[];

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    listeners = c.getAll<FaaSEventListener<any, any>>(FaaSEventListener);
}

const startPromise = start();

export async function handler(event: string, context: any, callback: any) {
    await startPromise;
    context.callbackWaitsForEmptyEventLoop = FaaSUtils.getCallbackWaitsForEmptyEventLoop();
    let result = await Promise.all(listeners.map(l => l.onTrigger(event)));
    result = result.filter(item => !!item);
    return result.length === 1 ? result[0] : result;

}
