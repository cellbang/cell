import { ApplicationStateService, AbstractApplication, Application } from '../common/application-protocol';
import { BackendApplicationStateService } from './backend-application-state';
import { Component, Autowired } from '../common/annotation';

@Component(Application)
export class BackendApplication extends AbstractApplication {

    @Autowired(ApplicationStateService)
    protected readonly stateService: BackendApplicationStateService;

    async start(): Promise<void> {
        this.setupExitSignals();
        await this.doStart();
        this.stateService.state = 'started';
        this.stateService.state = 'ready';
    }

    protected setupExitSignals() {
        process.on('SIGINT', () => {
            this.doStop();
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            this.doStop();
            process.exit(0);
        });
    }
}
