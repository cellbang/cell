import { container } from '../common/dynamic-container';
import { FrontendApplication } from './frontend-application';
import { ContainerProvider } from '../common/container-provider';
container.then(c => {
    ContainerProvider.set(c);
    const application = c.get(FrontendApplication);
    application.start().catch(reason => {
        console.error('Failed to start the frontend application.');
        if (reason) {
            console.error(reason);
        }
    });

});
