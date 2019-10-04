import { Component, ApplicationState, AbstractApplicationStateService, ApplicationStateService } from '../../common';

export type FrontendApplicationState =
    ApplicationState
    | 'attached_shell'
    | 'closing_window';

@Component(ApplicationStateService)
export class FrontendApplicationStateService extends AbstractApplicationStateService<FrontendApplicationState> {

}
