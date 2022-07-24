const casbin = require('casbin');
import { Enforcer } from 'casbin';
import TypeORMAdapter from 'typeorm-adapter';
export const CURRENT_CASBIN_CONTEXT_ENFORCER_KEY =
    'CurrentCasbinContextEnforcer';
export let EnforcerInstance: Enforcer;
export async function createEnforcer(options: any): Promise<any> {
    const dbConnect = await TypeORMAdapter.newAdapter(options.config[0]);
    const enforcer = await casbin.newEnforcer(options.confPath, dbConnect);
    EnforcerInstance = enforcer;
    return enforcer;
}
