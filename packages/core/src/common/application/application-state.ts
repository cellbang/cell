import { Component } from '../annotation';
import { AbstractApplicationStateService, ApplicationState, ApplicationStateService } from './application-protocol';

@Component(ApplicationStateService)
export class CommonApplicationStateService extends AbstractApplicationStateService<ApplicationState> {

}
