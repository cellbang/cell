import { BehaviorSubject } from 'rxjs';

export const Locale = Symbol('Locale');
export const LocaleManager = Symbol('LocaleManager');

export interface Locale {
    lang: string;
    priority: number;
    label?: string;
    messages: { [key: string]: string };
}

export interface LocaleManager {

    currentSubject: BehaviorSubject<Locale | undefined>;

    get(): Promise<Locale[]>;
}
