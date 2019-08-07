import { fluentProvide } from 'inversify-binding-decorators';
import { interfaces }from 'inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from '../jsonrpc';
export const rpc = (serviceIdentifier: interfaces.ServiceIdentifier<any>, path?: string) => fluentProvide(ConnectionHandler).inSingletonScope().onActivation((context, target) =>
    new JsonRpcConnectionHandler(path || serviceIdentifier.toString(), proxy => target)
).done(true);
