function getGlobalThis() {
    return globalThis || global || window || self;
}

export const globalThis: any = getGlobalThis();
