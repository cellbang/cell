import { ComponentFilterRegistry, ComponentType, ComponentFilterContribution, ComponentFilter } from './provider-protocol';
import { Autowired, Component, Optional } from '../annotation';

@Component(ComponentFilterRegistry)
export class ComponentFilterRegistryImpl implements ComponentFilterRegistry {

    protected initialized = false;
    protected genericFilters: ComponentFilter<Object>[] = [];
    protected typeToFilters = new Map<ComponentType, ComponentFilter<Object>[]>();

    constructor(
        @Autowired(ComponentFilterContribution) @Optional() contributions: ComponentFilterContribution[] = []
    ) {
        for (const contribution of contributions) {
            contribution.registerContributionFilters(this);
        }
        this.initialized = true;
    }

    addFilters(types: '*' | ComponentType[], filters: ComponentFilter<Object>[]): void {
        if (this.initialized) {
            throw new Error('cannot add filters after initialization is done.');
        } else if (types === '*') {
            this.genericFilters.push(...filters);
        } else {
            for (const type of types) {
                this.getOrCreate(type).push(...filters);
            }
        }
    }

    applyFilters<T extends Object>(toFilter: T[], type: ComponentType): T[] {
        const filters = this.getFilters(type);
        if (filters.length === 0) {
            return toFilter;
        }
        return toFilter.filter(
            object => filters.every(filter => filter(object))
        );
    }

    protected getOrCreate(type: ComponentType): ComponentFilter<Object>[] {
        let value = this.typeToFilters.get(type);
        if (value === undefined) {
            this.typeToFilters.set(type, value = []);
        }
        return value;
    }

    protected getFilters(type: ComponentType): ComponentFilter<Object>[] {
        return [
            ...this.typeToFilters.get(type) || [],
            ...this.genericFilters
        ];
    }
}
