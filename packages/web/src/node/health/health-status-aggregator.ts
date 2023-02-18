import { Component } from '@malagu/core';
import { HealthStatus, HealthStatusAggregator } from './health-protocol';

const defaultOrder: HealthStatus[] = [
    HealthStatus.DOWN,
    HealthStatus.OUT_OF_SERVICE,
    HealthStatus.UP,
    HealthStatus.UNKNOWN
];

@Component(HealthStatusAggregator)
export class HealthStatusAggregatorImpl implements HealthStatusAggregator {

    aggregate(statuses: HealthStatus[]): HealthStatus {
        return [...statuses, HealthStatus.UNKNOWN].reduce((a, b) => {
            const orderA = defaultOrder.indexOf(a);
            const orderB = defaultOrder.indexOf(b);
            return orderA < orderB ? a : b;
        });
    }

}
