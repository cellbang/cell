import { container } from '../../common/container/dynamic-container';
import { ContainerProvider, Application } from '../../common';
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
