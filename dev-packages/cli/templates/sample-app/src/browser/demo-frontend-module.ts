import { ContainerModule } from 'inversify';
import { ApplicationShell } from '@malagu/core/lib/browser/application-shell';
import { ApplicationShellImpl } from './antd-application-shell';
import { HelloWorldService } from './hello-world-service';

export { HelloWorldService } from './hello-world-service';
export default new ContainerModule((bind, rebind) => {
    rebind(ApplicationShell);

    bind(ApplicationShell).to(ApplicationShellImpl).inSingletonScope();
    bind(HelloWorldService).toSelf().inSingletonScope();
});