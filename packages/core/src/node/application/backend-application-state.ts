import { ApplicationState, AbstractApplicationStateService, ApplicationStateService, Component } from '../../common';

export type BackendApplicationState = ApplicationState;

@Component(ApplicationStateService)
export class BackendApplicationStateService extends AbstractApplicationStateService<BackendApplicationState> {

}
