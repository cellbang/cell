import { container } from '../common/dynamic-container';
import { FrontendApplication } from './frontend-application';
container.then(c => {
    const application = c.get(FrontendApplication);
    application.start().catch(reason => {
        console.error('Failed to start the frontend application.');
        if (reason) {
            console.error(reason);
        }
    });
});
