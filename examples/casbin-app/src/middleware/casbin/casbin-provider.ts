import { Component } from "@malagu/core";
import { CasbinProvider } from "./casbin-protocol";
import { EnforcerInstance } from "@malagu/casbin/lib/common/";

@Component(CasbinProvider)
export class tamperCasbinProvider implements CasbinProvider {
    priority = 1900;
    async authenticate(): Promise<any> {
        const e = EnforcerInstance;
        await e.loadPolicy();
        if (!(await e.enforce("admin1", "domain1", "data1", "read"))) {
            throw new Error("not authorized");
        }
    }

    async support(): Promise<boolean> {
        return true;
    }
}
