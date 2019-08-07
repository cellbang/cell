import { HelloWorldServer } from '../common/hello-world-protocol';
import { rpcInject, component } from '@malagu/core/lib/common/annotation';
import { FrontendApplicationLifecycle, FrontendApplication } from '@malagu/core/lib/browser/frontend-application';


@component(FrontendApplicationLifecycle)
export class HelloWorldService implements FrontendApplicationLifecycle {

    constructor(
        @rpcInject(HelloWorldServer) protected helloWorldServer: HelloWorldServer
    ){
    }

    onStart(app: FrontendApplication) {
        this.helloWorldServer.say().then(r => alert(r));
    }

    
}
