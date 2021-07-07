import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { Clock } from '@malagu/faas-adapter/lib/node/timer/timer-protocol';
import { FaaSEventListener } from '@malagu/faas-adapter/lib/node/event/event-protocol';

let clock: Clock;
let listeners: FaaSEventListener<any>[];

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    clock = c.get<Clock>(Clock);
    listeners = c.getAll<FaaSEventListener<any>>(FaaSEventListener);
}

const startPromise = start();

export async function handler(event: string, context: any) {
    await startPromise;
    await Promise.all(listeners.map(l => l.onTrigger(event)));
    await clock.tick();
    context.callbackWaitsForEmptyEventLoop = false;
}

