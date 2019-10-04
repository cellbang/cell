import { ApplicationStateService, AbstractApplication, Application, Component, Autowired } from '../../common';
import { BackendApplicationStateService } from './backend-application-state';

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
        process.removeListener('SIGINT', this.doExit);
        process.removeListener('SIGTERM', this.doExit);

        process.on('SIGINT', this.doExit.bind(this));
        process.on('SIGTERM', this.doExit.bind(this));
    }

    protected doExit() {
        this.doStop();
        process.exit(0);
    }
}
