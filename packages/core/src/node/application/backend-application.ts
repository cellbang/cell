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

    protected removeListeners(event: NodeJS.Signals) {
        for (const l of process.listeners(event)) {
            if ((l as any)._tag === BackendApplication.name) {
                process.removeListener(event, l);
            }
        }
    }

    protected setupExitSignals(): void {
        this.removeListeners('SIGINT');
        this.removeListeners('SIGTERM');
        const l = this.doExit.bind(this);
        l._tag = BackendApplication.name;
        process.once('SIGINT', l);
        process.once('SIGTERM', l);
    }

    protected doExit(): void {
        this.doStop();
        process.exit(0);
    }

    async stop(): Promise<void> {
        this.doStop();
        this.stateService.state = 'stoped';
    }
}
