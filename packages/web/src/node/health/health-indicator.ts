import { Component } from '@malagu/core';
import { Health, HealthIndicator, HealthStatus } from './health-protocol';

/**
 * Default implementation of {@link HealthIndicator} that returns {@link HealthStatus.UP}.
 */
@Component(HealthIndicator)
export class PingHealthIndicator implements HealthIndicator {
    async health(): Promise<Health> {
        return { status: HealthStatus.UP };
    }
}
