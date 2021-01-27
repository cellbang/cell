import { METADATA_KEY } from '../constants';

export const Resource = function (...resources: string[]) {
    return (target: any, targetKey?: string | symbol, descriptor?: any) => {
        if (targetKey) {
            Reflect.defineMetadata(METADATA_KEY.resource, resources, target.constructor, targetKey);
        } else {
            Reflect.defineMetadata(METADATA_KEY.resource, resources, target);
        }
    };

};
