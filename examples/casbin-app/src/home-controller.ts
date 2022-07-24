import { Conroller, Get } from "@malagu/mvc/lib/node";
import { EnforcerInstance } from "@malagu/casbin/lib/common/";

@Controller()
export class HomeController {
    @Get()
    async home() {
        const e = EnforcerInstance;
        // Load the policy from DB.
        await e.loadPolicy();

        // Check the permission.

        // Modify the policy.
        // await e.addPolicy("admin", "domain1", "data1", "read");
        // await e.removePolicy(...);

        // Save the policy back to DB.
        // await e.savePolicy();
        console.log(await e.enforce("admin", "domain1", "data1", "write"));
        console.log(await e.enforce("admin", "domain1", "data1", "read"));

        return '';
    }
}
