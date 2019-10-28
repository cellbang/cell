import { getSuperClasses } from './class-util';

export function getOwnMetadata(metadataKey: string, constructor: Object, propertyKey?: string | symbol): any {
    const constructors = [ constructor, ...getSuperClasses(constructor) ];
    let result: any[] = [];
    for (let index = 0; index < constructors.length; index++) {
        const c = constructors[constructors.length - index - 1];
        let metadata: any[];
        if (propertyKey) {
            metadata = Reflect.getOwnMetadata(metadataKey, c, propertyKey);
        } else {
            metadata = Reflect.getOwnMetadata(metadataKey, c);
        }

        if (metadata) {
            if (Array.isArray(metadata)) {
                result = [ ...result, ...metadata ];
            } else {
                return metadata;
            }
        }
    }
    return result;
}
