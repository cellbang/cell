import { injectable } from 'inversify';
import { ApplicationState, AbstractApplicationStateService } from '../common/application-protocol';

export type BackendApplicationState = ApplicationState;

@injectable()
export class BackendApplicationStateService extends AbstractApplicationStateService<BackendApplicationState> {

}
