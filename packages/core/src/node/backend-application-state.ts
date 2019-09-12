import { ApplicationState, AbstractApplicationStateService, ApplicationStateService } from '../common/application-protocol';
import { Component } from '../common/annotation/component';

export type BackendApplicationState = ApplicationState;

@Component(ApplicationStateService)
export class BackendApplicationStateService extends AbstractApplicationStateService<BackendApplicationState> {

}
