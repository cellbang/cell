import * as React from 'react';

export const ICON = Symbol('Icon');

export const IconResolver = Symbol('IconResolver');

export interface IconResolver<T> {
    resolve(iconProps: T): Promise<React.ReactNode>;
}
