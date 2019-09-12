import { ApplicationState, AbstractApplicationStateService, ApplicationStateService } from '../common/application-protocol';
import { Component } from '../common/annotation';

export type FrontendApplicationState =
    ApplicationState
    | 'attached_shell'
    | 'closing_window';

@Component(ApplicationStateService)
export class FrontendApplicationStateService extends AbstractApplicationStateService<FrontendApplicationState> {

}
