import mergeWith = require('lodash.mergewith');

export namespace ConfigUtil {

    export function merge(...objects: any[]) {
        const customizer = (objValue: any, srcValue: any) => {
            if (Array.isArray(objValue)) {
                return srcValue;
            }
        };
        const last = objects[objects.length - 1];
        const [first, ...rest] = objects;
        return mergeWith(first, ...rest, typeof last === 'function' ? last : customizer);
    }
}
