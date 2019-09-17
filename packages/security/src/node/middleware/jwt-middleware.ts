import { Middleware, Context } from '@malagu/core/lib/node';
import { verify, JsonWebTokenError } from 'jsonwebtoken';
import { injectable, inject } from 'inversify';
import { ConfigProvider } from '@malagu/core/lib/common/config-provider';

export const TOKEN_DECODED = 'tokenDecoded';

export const JWT_SECRET_OR_PUBLIC_KEY = 'security.jwt.secretOrPublicKey';

// tslint:disable:no-any

@injectable()
export class JWTMiddleWare implements Middleware {

    @inject(ConfigProvider)
    protected readonly configProvider: ConfigProvider;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        const token = (await Context.getChannalStrategy().getMessage() as any).token;
        if (token) {
            Context.setAttr(TOKEN_DECODED, verify(token, await this.configProvider.get<string>(JWT_SECRET_OR_PUBLIC_KEY, '123456')));
        } else {
            throw new JsonWebTokenError('Token is required.');
        }
        await next();
    }

    readonly priority: number = 1000;

}
