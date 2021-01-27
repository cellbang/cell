import { METADATA_KEY } from '../constants';

export const Action = function (name: string) {
    return (target: any, targetKey: string | symbol, descriptor: any) => {
        Reflect.defineMetadata(METADATA_KEY.action, name, target.constructor, targetKey);
    };

};
