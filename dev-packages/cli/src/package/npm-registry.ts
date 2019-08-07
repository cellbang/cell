// tslint:disable:no-any

export interface Author {
    name: string;
    email: string;
}

export interface Maintainer {
    username: string;
    email: string;
}

export interface Dependencies {
    [name: string]: string | undefined;
}

export interface NodePackage {
    name?: string;
    version?: string;
    description?: string;
    publisher?: Maintainer;
    author?: string | Author;
    maintainers?: Maintainer[];
    keywords?: string[];
    dependencies?: Dependencies;
    [property: string]: any;
}

export interface PublishedNodePackage extends NodePackage {
    name: string;
    version: string;
}
export namespace PublishedNodePackage {
    export function is(pck: NodePackage | undefined): pck is PublishedNodePackage {
        return !!pck && !!pck.name && !!pck.version;
    }
}

export function sortByKey(object: { [key: string]: any }) {
    return Object.keys(object).sort().reduce((sorted, key) => {
        sorted[key] = object[key];
        return sorted;
    }, {} as { [key: string]: any });
}
