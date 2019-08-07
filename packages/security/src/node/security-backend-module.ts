import { ContainerModule } from 'inversify';
import { UserServer, userPath, AuthServer, authPath } from '../common';
import { UserServerImpl } from './user-server';
import { JsonRpcConnectionHandler, ConnectionHandler } from '@malagu/core/lib/common';
import { AuthServerImpl } from './auth-server';
import { Middleware } from '@malagu/core/lib/node';
import { JWTMiddleWare } from './middleware';

export default new ContainerModule(bind => {
    bind(Middleware).to(JWTMiddleWare).inSingletonScope();
    bind(UserServer).to(UserServerImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(userPath, () => {
            const userServer = ctx.container.get<UserServer>(UserServer);
            return userServer;
        })
    ).inSingletonScope();

    bind(AuthServer).to(AuthServerImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(authPath, () => {
            const authServer = ctx.container.get<AuthServer>(AuthServer);
            return authServer;
        })
    ).inSingletonScope();

});
