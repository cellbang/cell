let resolveMode = false;

export function isResolveMode(): boolean {
    return resolveMode;
}

export function getTargetClass(obj: any): any {
    try {
        resolveMode = true;
        const target = obj.target;
        return target ? target.constructor : obj.constructor;

    } finally {
        resolveMode = false;
    }
}

export function getTarget(obj: any): any {
    try {
        resolveMode = true;
        const target = obj.target;
        return target || obj;

    } finally {
        resolveMode = false;
    }
}

export function isProxy(obj: any): boolean {
    try {
        resolveMode = true;
        return !!obj.target;
    } finally {
        resolveMode = false;
    }
}
