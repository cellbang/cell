import { injectable } from 'inversify';
import { ApplicationState, AbstractApplicationStateService } from '../common/application-protocol';

export type FrontendApplicationState =
    ApplicationState
    | 'attached_shell'
    | 'closing_window';

@injectable()
export class FrontendApplicationStateService extends AbstractApplicationStateService<FrontendApplicationState> {

}
