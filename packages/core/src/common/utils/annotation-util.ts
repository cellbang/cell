export namespace AnnotationUtil {

    export function getValueOrOption<T>(valueOrOption?: any, primaryProperty = 'id'): T {
        let option = {};
        if (typeof valueOrOption === 'object' && !Array.isArray(valueOrOption)) {
            option = valueOrOption;
        } else if (valueOrOption) {
            option = { [primaryProperty]: valueOrOption };
        }
        return option as T;
    }

    export function getType(target: any, targetKey: string | symbol, index?: number) {
        if (index !== undefined)  {
            return Reflect.getMetadata('design:paramtypes', target, targetKey)[index];
        } else {
            return Reflect.getMetadata('design:type', target, targetKey);
        }
    }

}
