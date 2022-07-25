import { Middleware, Context } from "@malagu/web/lib/node";
import { Autowired, Component } from "@malagu/core";
import { CasbinManager } from "./casbin-protocol";
import { SESSION_MIDDLEWARE_PRIORITY } from "@malagu/web/lib/node/session/session-protocol";

@Component(Middleware)
export class CasbinMiddleware implements Middleware {
    @Autowired(CasbinManager)
    protected readonly casbinManager: CasbinManager;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (await this.casbinManager.support()) {
            try {
                await this.casbinManager.authenticate(next);
            } catch (error) {
                console.log(
                    `Error | ${ctx.request.path.toString()} | ${error}`
                );

                ctx.status = 200;
                ctx.response.setHeader("Content-Type", "application/json");
                ctx.response.end(
                    JSON.stringify({
                        code: 1,
                        message: error.message,
                        type: "error",
                    })
                );
                return;
            }
        }
        await next();
    }

    readonly priority = SESSION_MIDDLEWARE_PRIORITY - 300;
}
