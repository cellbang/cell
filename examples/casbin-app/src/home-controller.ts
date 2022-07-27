import { Controller, Get } from "@malagu/mvc/lib/node";
import { EnforcerInstance } from "@malagu/casbin/lib/common/";

@Controller()
export class HomeController {
    @Get()
    async home() {
        // const e = EnforcerInstance;
        // Modify the policy.
        // await e.addPolicy("admin", "domain1", "data1", "read");
        // await e.removePolicy(...);

        // Save the policy back to DB.
        // await e.savePolicy();
        return "Welcome to Malagu Casbin!";
    }
}
