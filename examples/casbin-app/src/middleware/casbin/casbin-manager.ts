import { Component, Autowired, Prioritizeable } from "@malagu/core";
import { postConstruct } from "inversify";
import { CasbinManager, CasbinProvider } from "./casbin-protocol";

@Component(CasbinManager)
export class CasbinManagerImpl implements CasbinManager {
    protected prioritized: CasbinProvider[];

    @Autowired(CasbinProvider)
    protected readonly CasbinProviders: CasbinProvider[];

    @postConstruct()
    async init() {
        this.prioritized = Prioritizeable.prioritizeAllSync(
            this.CasbinProviders
        ).map((c) => c.value);
    }

    async authenticate(next: () => Promise<void>): Promise<void> {
        for (const authenticationProvider of this.prioritized) {
            try {
                if (await authenticationProvider.support()) {
                    await authenticationProvider.authenticate();
                }
            } catch (error) {
                throw error;
            }
        }
    }

    async support(): Promise<boolean> {
        for (const CasbinProvider of this.prioritized) {
            if (await CasbinProvider.support()) {
                return true;
            }
        }
        return false;
    }
}
