import { IllegalStateError } from '../error/illegal-state-error';
import { getSuperClasses } from './class-util';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-null/no-null */

export abstract class Assert {
    /**
     * Assert a boolean expression, throwing an `IllegalStateError`
     * if the expression evaluates to `false`.
     * @param expression a boolean expression
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if `expression` is `false`
     * @example
     * Assert.state(id === undefined, "The id property must not already be initialized");
     * Assert.state(entity.getId() === undefined,
     *     () => "ID for entity " + entity.getName() + " must not already be initialized");
     */
    static state(expression: boolean, message: string | (() => string)): void {
        if (!expression) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert a boolean expression, throwing an `IllegalStateError`
     * if the expression evaluates to `false`.
     * @param expression a boolean expression
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if `expression` is `false`
     * @example
     * Assert.isTrue(i > 0, "The value must be greater than zero");
     * Assert.isTrue(i > 0, () => "The value '" + i + "' must be greater than zero");
     */
    static isTrue(expression: boolean, message: string | (() => string)): void {
        if (!expression) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that an object is `undefined`.
     * @param object the object to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the object is not `undefined`
     * @example
     * Assert.isNull(value, "The value must be null");
     * Assert.isNull(value, () => "The value '" + value + "' must be null");
     */
    static isNull(object: any, message: string | (() => string)): void {
        if (object !== undefined || object !== null) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that an object is not `undefined`.
     * @param object the object to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the object is `undefined`
     * @example
     * Assert.notNull(clazz, "The class must not be null");
     * Assert.notNull(entity.getId(),
     *     () => "ID for entity " + entity.getName() + " must not be null");
     */
    static notNull(object: unknown, message: string | (() => string)): void {
        if (object === undefined || object === null) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that the given String is not empty; that is,
     * it must not be `undefined` and not the empty String.
     * @param text the String to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the text is empty
     * @example
     * Assert.hasLength(name, "Name must not be empty");
     * Assert.hasLength(name, () => "Name for account '" + account.getId() + "' must not be empty");
     */
    static hasLength(text: string | undefined, message: string | (() => string)): void {
        if (!text || text.length === 0) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that the given String contains valid text content; that is, it must not
     * be `undefined` and must contain at least one non-whitespace character.
     * @param text the String to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the text does not contain valid text content
     * @example
     * Assert.hasText(account.getName(), "Name must not be empty");
     * Assert.hasText(account.getName(),
     *    () => "Name for account '" + account.getId() + "' must not be empty");
     */
    static hasText(text: string | undefined, message: string | (() => string)): void {
        if (!text || text.trim().length === 0) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that the given text does not contain the given substring.
     * @param textToSearch the text to search
     * @param substring the substring to find within the text
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the text contains the substring
     * @example
     * Assert.doesNotContain(name, forbidden, "Name must not contain '" + forbidden + "'");
     * Assert.doesNotContain(name, forbidden,
     *    () => "Name must not contain '" + forbidden + "'");
     */
    static doesNotContain(textToSearch: string | undefined, substring: string, message: string | (() => string)): void {
        if (textToSearch && substring && textToSearch.includes(substring)) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that an array contains elements; that is, it must not be
     * `undefined` and must contain at least one element.
     * @param array the array to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the object array is `undefined` or contains no elements
     * @example
     * Assert.notEmpty(array, "The array must contain elements");
     * Assert.notEmpty(array, () => "The " + arrayType + " array must contain elements");
     */
    static notEmpty(array: unknown[] | undefined, message: string | (() => string)): void {
        if (!array || array.length === 0) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that an array contains no `undefined` elements.
     * <p>Note: Does not complain if the array is empty!
     * @param array the array to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the object array contains a `undefined` element
     * @example
     * Assert.noNullElements(array, "The array must contain non-null elements");
     * Assert.noNullElements(array, () => "The " + arrayType + " array must contain non-null elements");
     */
    static noNullElements(array: unknown[] | undefined, message: string | (() => string)): void {
        if (array) {
            for (const element of array) {
                if (element === undefined || element === null) {
                    throw new IllegalStateError(this.resolveMessage(message));
                }
            }
        }
    }

    /**
     * Assert that a collection contains elements; that is, it must not be
     * `undefined` and must contain at least one element.
     * @param collection the collection to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the collection is `undefined` or
     * contains no elements
     * @example
     * Assert.notEmpty(collection, "Collection must contain elements");
     * Assert.notEmpty(collection, () => "The " + collectionType + " collection must contain elements");
     */
    static notEmptyCollection(collection: unknown[] | undefined, message: string | (() => string)): void {
        if (!collection || collection.length === 0) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that a collection contains no `undefined` elements.
     * <p>Note: Does not complain if the collection is empty!
     * @param collection the collection to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the collection contains a `undefined`
     * @example
     * Assert.noNullElements(collection, "Collection must contain non-null elements");
     * Assert.noNullElements(collection, () => "The " + collectionName + " must contain non-null elements");
     */
    static noNullElementsCollection(collection: unknown[] | undefined, message: string | (() => string)): void {
        if (collection) {
            for (const element of collection) {
                if (element === undefined || element === null) {
                    throw new IllegalStateError(this.resolveMessage(message));
                }
            }
        }
    }

    /**
     * Assert that a Map contains entries; that is, it must not be `undefined`
     * and must contain at least one entry.
     * @param map the map to check
     * @param message the exception message to use if the assertion fails
     * @throws IllegalStateError if the map is `undefined` or contains no entries
     * @example
     * Assert.notEmpty(map, "The map must contain entries");
     * Assert.notEmpty(map, () => "The " + mapType + " map must contain entries");
     */
    static notEmptyMap(map: Map<unknown, unknown> | undefined, message: string | (() => string)): void {
        if (!map || map.size === 0) {
            throw new IllegalStateError(this.resolveMessage(message));
        }
    }

    /**
     * Assert that the provided object is an instance of the provided class.
     * @param type the type to check against
     * @param obj the object to check
     * @param message a message which will be prepended to provide further context.
     * If it is empty or ends in ":" or ";" or "," or ".", a full exception message
     * will be appended. If it ends in a space, the name of the offending object's
     * type will be appended. In any other case, a ":" with a space and the name
     * of the offending object's type will be appended.
     * @throws IllegalStateError if the object is not an instance of type
     * @example
     * Assert.instanceOf(Foo, foo, "Foo expected");
     * Assert.instanceOf(Foo, foo, () => "Processing " + Foo.name + ":");
     * Assert.instanceOf(Foo, foo);
     */
    static isInstanceOf(type: any, obj: unknown, message?: string | (() => string)): void {
        this.notNull(type, 'Type to check against must not be null');
        if (!(obj instanceof type)) {
            this.instanceCheckFailed(type, obj, this.resolveMessage(message));
        }
    }

    /**
     * Assert that `superType.isAssignableFrom(subType)` is `true`.
     * @param superType the supertype to check against
     * @param subType the subtype to check
     * @param message a message which will be prepended to provide further context.
     * If it is empty or ends in ":" or ";" or "," or ".", a full exception message
     * will be appended. If it ends in a space, the name of the offending subtype
     * will be appended. In any other case, a ":" with a space and the name of the
     * offending subtype will be appended.
     * @throws IllegalStateError if the classes are not assignable
     * @example
     * Assert.isAssignable(Number, myClass, "Number expected");
     * Assert.isAssignable(Number, myClass, () => "Processing " + myAttributeName + ":");
     */
    static isAssignable(superType: unknown, subType: any | undefined, message?: string | (() => string)): void {
        this.notNull(superType, 'Supertype to check against must not be null');
        if (subType === undefined || !getSuperClasses(subType).includes(superType)) {
            this.assignableCheckFailed(superType, subType, this.resolveMessage(message));
        }
    }

    private static instanceCheckFailed(type: unknown, obj: any | undefined, msg: string | undefined): void {
        const className = (obj !== undefined ? obj.constructor.name : 'undefined');
        let result = '';
        let defaultMessage = true;
        if (msg && msg.length > 0) {
            if (this.endsWithSeparator(msg)) {
                result = msg + ' ';
            } else {
                result = this.messageWithTypeName(msg, className);
                defaultMessage = false;
            }
        }
        if (defaultMessage) {
            result = result + (`Object of class [${className}] must be an instance of ${type}`);
        }
        throw new IllegalStateError(result);
    }

    private static assignableCheckFailed(superType: unknown, subType: unknown | undefined, msg: string | undefined): void {
        let result = '';
        let defaultMessage = true;
        if (msg && msg.length > 0) {
            if (this.endsWithSeparator(msg)) {
                result = msg + ' ';
            } else {
                result = this.messageWithTypeName(msg, subType);
                defaultMessage = false;
            }
        }
        if (defaultMessage) {
            result = result + (`${subType} is not assignable to ${superType}`);
        }
        throw new IllegalStateError(result);
    }

    private static endsWithSeparator(msg: string): boolean {
        return (msg.endsWith(':') || msg.endsWith(';') || msg.endsWith(',') || msg.endsWith('.'));
    }

    private static messageWithTypeName(msg: string, typeName: any): string {
        return msg + (msg.endsWith(' ') ? '' : ': ') + ('name' in typeName) ? typeName.name : typeName;
    }

    private static resolveMessage(message?: (() => string) | string): string | undefined {
        return typeof message === 'function'  ? message() : message;
    }
}
