import { ComponentId } from '../annotation/component';
import { Provider, ComponentFilterRegistry } from './provider-protocol';
import { Container } from '../container';
import { Prioritizeable } from '../utils';

const DEFAULT_GET_PRIORITY: Prioritizeable.GetPrioritySync<any> = value => {
    if (value) {
        if ('priority' in value) {
            return value.priority;
        } else if ('order' in value) {
            return value.order;
        }
        return 0;
    }
};

export class ContainerBasedProvider<T extends object> implements Provider<T> {

    protected components: T[] | undefined;

    constructor(
        protected readonly componentId: ComponentId<T>,
        protected readonly container: Container
    ) { }

    get(recursive?: boolean): T[] {
        if (this.components === undefined) {
            const currentComponents: T[] = [];
            let filterRegistry: ComponentFilterRegistry | undefined;
            let currentContainer: Container | null = this.container;
            // eslint-disable-next-line no-null/no-null
            while (currentContainer !== null) {
                if (currentContainer.isBound(this.componentId)) {
                    try {
                        currentComponents.push(...currentContainer.getAll(this.componentId));
                    } catch (error) {
                        console.error(error);
                    }
                }
                if (filterRegistry === undefined && currentContainer.isBound(ComponentFilterRegistry)) {
                    filterRegistry = currentContainer.get(ComponentFilterRegistry);
                }
                // eslint-disable-next-line no-null/no-null
                currentContainer = recursive === true ? currentContainer.parent : null;
            }

            this.components = filterRegistry ? filterRegistry.applyFilters(currentComponents, this.componentId) : currentComponents;

        }
        return this.components;
    }

    sortSync(getPriority: Prioritizeable.GetPrioritySync<T> = DEFAULT_GET_PRIORITY, recursive?: boolean): T[] {
        this.components = Prioritizeable.prioritizeAllSync<T>(this.get(recursive), getPriority).map(c => c.value);
        return this.components;
    }

    async sort(getPriority: Prioritizeable.GetPriority<T> = DEFAULT_GET_PRIORITY, recursive?: boolean): Promise<T[]> {
        const result = await Prioritizeable.prioritizeAll<T>(this.get(recursive), getPriority);
        this.components = result.map<T>(c => c.value);
        return this.components;
    }
}
