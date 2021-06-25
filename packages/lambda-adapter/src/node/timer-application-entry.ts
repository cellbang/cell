import { container } from '@malagu/core/lib/common/container/dynamic-container';
import { Application } from '@malagu/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@malagu/core/lib/common/container/container-provider';
import { Clock } from '@malagu/faas-adapter/lib/node/timer/timer-protocal';

let clock: Clock;

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    clock = c.get<Clock>(Clock);
}

const startPromise = start();

export async function handler(event: string, context: any) {
    await startPromise;
    return clock.tick();
}

