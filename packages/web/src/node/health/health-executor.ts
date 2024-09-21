import { Autowired, Component, getTargetClass } from '@celljs/core';
import { HealthNotFoundError } from './health-errors';
import { CompositeHealth, HealthComponent, HealthExecutor, HealthIndicator, HealthStatusAggregator } from './health-protocol';

@Component(HealthExecutor)
export class HealthExecutorImpl implements HealthExecutor {

    @Autowired(HealthIndicator)
    protected readonly healthIndicators: HealthIndicator[];

    @Autowired(HealthStatusAggregator)
    protected readonly healthStatusAggregator: HealthStatusAggregator;

    protected getHealthIndicatorName(healthIndicator: HealthIndicator): string | undefined {
        return getTargetClass(healthIndicator)?.name?.toLowerCase();
    }

    async execute(indicatorName?: string): Promise<HealthComponent> {
        if (indicatorName) {
            const healthIndicator = this.healthIndicators.find(h => {
                const name = this.getHealthIndicatorName(h);
                return name?.startsWith(indicatorName);
            });
            if (healthIndicator) {
                return healthIndicator.health();
            }
            throw new HealthNotFoundError(indicatorName, `Health indicator ${indicatorName} not found`);
        }
        const components: { [key: string]: HealthComponent } = {};
        for (const healthIndicator of this.healthIndicators) {
            const name = this.getHealthIndicatorName(healthIndicator);
            if (name) {
                components[name.toLowerCase().replace('healthindicator', '')] = await healthIndicator.health();
            }
        }

        await Promise.all(this.healthIndicators.map(async h => {
            const name = this.getHealthIndicatorName(h);
            if (name) {
                components[name.toLowerCase().replace('healthindicator', '')] = await h.health();
            }
        }));

        return <CompositeHealth>{
            status: this.healthStatusAggregator.aggregate(Object.values(components).map(c => c.status)),
            components
        };
    }

}
