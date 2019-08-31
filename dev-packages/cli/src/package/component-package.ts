import { PublishedNodePackage, NodePackage } from './npm-registry';
import { ApplicationProps } from './application-props';

export interface Component {
    name: any;
    config?: ApplicationProps;
    frontends?: string[];
    backends?: string[];
    initHooks?: string[];
    serveHooks?: string[];
    deployHooks?: string[];
}

export class ComponentPackage {
    constructor(
        readonly raw: PublishedNodePackage & Partial<RawComponentPackage>
    ) { }

    get name(): string {
        return this.raw.name;
    }

    get version(): string {
        return this.raw.version;
    }

    get description(): string {
        return this.raw.description || '';
    }

    get malaguComponent(): Component | undefined {
        return this.raw.malaguComponent;
    }

    getAuthor(): string {
        if (this.raw.publisher) {
            return this.raw.publisher.username;
        }
        if (typeof this.raw.author === 'string') {
            return this.raw.author;
        }
        if (this.raw.author && this.raw.author.name) {
            return this.raw.author.name;
        }
        if (!!this.raw.maintainers && this.raw.maintainers.length > 0) {
            return this.raw.maintainers[0].username;
        }
        return '';
    }
}

export interface RawComponentPackage extends PublishedNodePackage {
    malaguComponent: Component;
}
export namespace RawComponentPackage {
    export function is(pck: NodePackage | undefined): pck is RawComponentPackage {
        return PublishedNodePackage.is(pck) && !!pck.malaguComponent;
    }
}
