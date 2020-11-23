export namespace AnnotationUtil {

    export function getValueOrOption<T>(valueOrOption?: any, primaryProperty = 'id'): T {
        let opiton = {};
        if (typeof valueOrOption === 'object' && !Array.isArray(valueOrOption)) {
            opiton = valueOrOption;
        } else if (valueOrOption) {
            opiton = { [primaryProperty]: valueOrOption };
        }
        return opiton as T;
    }

    export function getType(target: any, targetKey: string | symbol, index?: number) {
        if (index !== undefined)  {
            return Reflect.getMetadata('design:paramtypes', target, targetKey)[index];
        } else {
            return Reflect.getMetadata('design:type', target, targetKey);
        }
    }

}
