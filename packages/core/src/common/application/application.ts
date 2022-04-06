import { Component, Autowired } from '../annotation';
import { AbstractApplication, Application, ApplicationState, ApplicationStateService } from './application-protocol';

@Component(Application)
export class CommonApplication extends AbstractApplication {

    @Autowired(ApplicationStateService)
    protected readonly stateService: ApplicationStateService<ApplicationState>;

    async start(): Promise<void> {
        await this.doStart();
        this.stateService.state = 'started';
        this.stateService.state = 'ready';
    }

    async stop(): Promise<void> {
        this.doStop();
        this.stateService.state = 'stoped';
    }
}
