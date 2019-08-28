import { inject, injectable } from 'inversify';
import { ApplicationStateService, AbstractApplication } from '../common/application-protocol';
import { BackendApplicationStateService } from './backend-application-state';

@injectable()
export class BackendApplication extends AbstractApplication {

    @inject(ApplicationStateService)
    protected readonly stateService: BackendApplicationStateService;

    async start(): Promise<void> {
        process.on('SIGTERM', () => {
            this.doStop();
            process.exit(0);
        });
        await this.doStart();
        this.stateService.state = 'started';
        this.stateService.state = 'ready';
    }
}
