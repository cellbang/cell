
export function getTargetClass(obj: any) {
    return obj.target ? obj.target.constructor : obj.constructor;

}

export function getTarget(obj: any) {
    return obj.target || obj;

}
