import { optional } from 'inversify';

export interface OptionalDecorator {
    (): (target: any, targetKey: string, index?: number) => any;
    (target: any, targetKey: string, index?: number): any;
}

export const Optional = <OptionalDecorator>function (target: any, targetKey: string, index?: number) {
    if (target === undefined) {
        return optional();
    } else {
        optional()(target, targetKey, index);
    }
};
