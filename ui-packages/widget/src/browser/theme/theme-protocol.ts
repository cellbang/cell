import { BehaviorSubject } from 'rxjs';

export const Theme = Symbol('Theme');
export const ThemeManager = Symbol('ThemeManager');

export const DEFAULT_THEME = 'default';

export interface Theme<T> {
    id: string
    label: string;
    color: string;
    priority: number;
    props: T;
    metadata: { [key: string]: any }
}

export interface ThemeManager<T> {

    currentSubject: BehaviorSubject<Theme<T> | undefined>;

    get(): Promise<Theme<T>[]>;
}
