export function getSuperClasses(constructor: any): any[] {
    const constructors = [];
    let current = constructor;
    while (Object.getPrototypeOf(current)) {
        current = Object.getPrototypeOf(current);
        constructors.push(current);
    }
    return constructors;
}
