import { container } from '../common/dynamic-container';
import { ContainerProvider } from '../common/container-provider';
import { Application } from '../common/application-protocol';
container.then(c => {
    ContainerProvider.set(c);
    const application = c.get<Application>(Application);
    application.start().catch(reason => {
        console.error('Failed to start the frontend application.');
        if (reason) {
            console.error(reason);
        }
    });

});
