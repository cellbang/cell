import { ComponentId } from '../annotation/component';
import { Container } from '../container';
import { Prioritizeable } from '../utils/prioritizeable';

export const ProviderCreator = Symbol('ProviderCreator');
export const ComponentFilter = Symbol('ComponentFilter');
export const ComponentFilterRegistry = Symbol('ComponentFilterRegistry');
export const ComponentFilterContribution = Symbol('ComponentFilterContribution');

export interface Provider<T extends object> {
    get(recursive?: boolean): T[];
    sortSync(getPriority?: Prioritizeable.GetPrioritySync<T>, recursive?: boolean): T[];
    sort(getPriority?: Prioritizeable.GetPriority<T> , recursive?: boolean): Promise<T[]>;
}

export interface ProviderCreator<T extends object> {
    create(id: ComponentId, container: Container): Provider<T>;
}

/**
 * @param toTest Object that should be tested
 * @returns `true` if the object passes the test, `false` otherwise.
 */
export type ComponentFilter<T extends Object> = (toTest: T) => boolean;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentType = ComponentId;

export interface ComponentFilterRegistry {

    /**
     * Add filters to be applied for every type of component.
     */
    addFilters(types: '*', filters: ComponentFilter<Object>[]): void;

    /**
     * Given a list of component types, register filters to apply.
     * @param types types for which to register the filters.
     */
    addFilters(types: ComponentType[], filters: ComponentFilter<Object>[]): void;

    /**
     * Applies the filters for the given component type. Generic filters will be applied on any given type.
     * @param toFilter the elements to filter
     * @param type the component type for which potentially filters were registered
     * @returns the filtered elements
     */
    applyFilters<T extends Object>(toFilter: T[], type: ComponentType): T[]
}

/**
 * Register filters to remove contributions.
 */
export interface ComponentFilterContribution {
    /**
     * Use the registry to register your contribution filters.
     */
    registerContributionFilters(registry: ComponentFilterRegistry): void;
}
