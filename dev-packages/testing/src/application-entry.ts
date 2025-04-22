import { container } from '@celljs/core/lib/common/container/dynamic-container';
import { Application, ContainerProvider } from '@celljs/core';
export { container } from '@celljs/core/lib/common/container/dynamic-container';
(async () => {
    const c = await container;
    try {
        ContainerProvider.provide();
        return;
    } catch (error) {
        // NoOp
    }
    ContainerProvider.set(c);
    const application = c.get<Application>(Application);
    application.start().catch(reason => {
        console.error(`Failed to start the ${application.constructor.name}.`);
        if (reason) {
            console.error(reason);
        }
    });

})();
