const casbin = require('casbin');
import { Enforcer } from 'casbin';
import TypeORMAdapter from 'typeorm-adapter';
export const CURRENT_CASBIN_CONTEXT_ENFORCER_KEY =
    'CurrentCasbinContextEnforcer';
export let EnforcerInstance: Enforcer;
export async function createEnforcer(
    config: any,
    dataSource: string
): Promise<any> {
    const dbConnect = await TypeORMAdapter.newAdapter(config);
    const enforcer = await casbin.newEnforcer(dataSource, dbConnect);
    EnforcerInstance = enforcer;
    return enforcer;
}
