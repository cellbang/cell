import { PublishedNodePackage, NodePackage } from './npm-registry';
import { Command } from 'commander';
import { Settings } from '../settings/settings-protocol';

export type ApplicationLog = (message?: any, ...optionalParams: any[]) => void;

export class ApplicationConfigOptions {
    readonly targets: string[];
    readonly program: Command;
}

export class ApplicationPackageOptions {
    readonly dev: boolean;
    readonly mode: string[];
    readonly runtime?: string;
    readonly projectPath: string;
    readonly log?: ApplicationLog;
    readonly error?: ApplicationLog;
    readonly settings?: Settings;
}

export type ApplicationModuleResolver = (modulePath: string) => string;

export function customizer(objValue: any, srcValue: any) {
    if (Array.isArray(objValue)) {
        return srcValue;
    }
}

export interface Props {

    [key: string]: any;

    malagu: any;

}

export interface Component extends Props {
    name: any;

    runtime?: string;

    mode?: string[];

    /**
     * Frontend related properties.
     */
    frontend: Props;

    /**
     * Backend specific properties.
     */
    backend: Props;

    configFiles: string[];

}

export class Module {
    name: string;
    path: string;
    componentName: string;
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

    get modulePath(): string {
        return this.raw.modulePath || '';
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
        return PublishedNodePackage.is(pck) && !!pck.keywords && pck.keywords.indexOf('malagu-component') !== -1;
    }
}
