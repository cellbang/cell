
export function getTargetClass(obj: any): any {
    return obj.target ? obj.target.constructor : obj.constructor;

}

export function getTarget(obj: any): any {
    return obj.target || obj;

}
