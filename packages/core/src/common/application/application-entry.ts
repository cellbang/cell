import { container } from '../container/dynamic-container';
import { Application } from './application-protocol';
import { ContainerProvider } from '../container';
container.then(c => {
    ContainerProvider.set(c);
    const application = c.get<Application>(Application);
    application.start().catch(reason => {
        console.error(`Failed to start the ${application.constructor.name}.`);
        if (reason) {
            console.error(reason);
        }
    });

});
