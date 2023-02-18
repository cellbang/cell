import { HTTP_MIDDLEWARE_PRIORITY } from '../http/http-protocol';

export const HealthIndicator = Symbol('HealthIndicator');
export const HealthExecutor = Symbol('HealthExecutor');
export const HealthStatusAggregator = Symbol('HealthStatusAggregator');

export const HEALTH_MIDDLEWARE_PRIORITY = HTTP_MIDDLEWARE_PRIORITY - 100;

export enum HealthStatus {
    /**
     * {@link HealthStatus} indicating that the component or subsystem is in an unknown state.
     */
    UP = 'UP',
    /**
     * {@link HealthStatus} indicating that the component or subsystem has suffered an
     * unexpected failure.
     */
    DOWN = 'DOWN',
    /**
     * {@link HealthStatus} indicating that the component or subsystem has been taken out of
     * service and should not be used.
     */
    OUT_OF_SERVICE = 'OUT_OF_SERVICE',
    /**
     * {@link HealthStatus} indicating that the component or subsystem is in an unknown state.
     */
    UNKNOWN = 'UNKNOWN'
}

/**
 * A component that contributes data to results returned from the {@link HealthEndpoint}.
 */
export interface HealthComponent {
    status: HealthStatus;
}

/**
 * Carries information about the health of a component or subsystem. Extends
 * {@link HealthComponent} so that additional contextual details about the system can be
 * returned along with the {@link HealthStatus}.
 */
export interface Health extends HealthComponent {
    details?: { [key: string]: any };
}

/**
 * A {@link HealthComponent} that is composed of other {@link HealthComponent} instances.
 * Used to provide a unified view of related components. For example, a database health
 * indicator may be a composite containing the {@link Health} of each datasource
 * connection.
 */
export interface CompositeHealth extends HealthComponent {
    components: { [key: string]: HealthComponent };
}

/**
 * Strategy interface used to contribute {@link Health} to the results returned from the health endpoint.
 */
export interface HealthIndicator {
    /**
     * Return an indication of health.
     * @return the health
     */
    health(): Promise<Health>;
}

/**
 * Strategy interface used to execute {@link HealthIndicator} instances.
 */
export interface HealthExecutor {

    execute(indicatorName?: string): Promise<HealthComponent>;
}

/**
 * Strategy interface used to aggregate {@link HealthStatus} instances.
 */
export interface HealthStatusAggregator {
    /**
     * Aggregate the given health statuses into a single status.
     * @param statuses the health statuses to aggregate
     * @return the aggregated status
     */
    aggregate(statuses: HealthStatus[]): HealthStatus;
}

export interface HealthOptions {
    url: string;
    method: string;
}
