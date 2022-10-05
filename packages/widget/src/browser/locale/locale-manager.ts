import { LocaleManager, Locale } from './locale-protocol';
import { Component, Value, Autowired, Optional, Prioritizeable, PostConstruct } from '@malagu/core';
import { BehaviorSubject } from 'rxjs';

@Component(LocaleManager)
export class LocaleManagerImpl implements LocaleManager {

    protected readonly langStorageKey = 'malagu:lang';

    @Value('malagu.locales')
    protected readonly localesForConfig: { [lang: string]: Locale };

    @Autowired(Locale) @Optional()
    protected readonly locales: Locale[];

    protected prioritized: Locale[];

    currentSubject = new BehaviorSubject<Locale | undefined>(undefined);

    @PostConstruct()
    async init() {
        const locales = await this.get();
        const lang = localStorage.getItem(this.langStorageKey) || navigator.language;
        if (locales.length) {
            this.currentSubject.next(locales.find(l => l.lang === lang) || locales[0]);
        }

        this.currentSubject.subscribe(locale => {
            if (locale) {
                localStorage.setItem(this.langStorageKey, locale.lang);
            } else {
                localStorage.removeItem(this.langStorageKey);
            }
        });
    }

    async get(): Promise<Locale[]> {
        if (!this.prioritized) {
            const config = this.localesForConfig || {};
            const parsedLacalesForConfig = Object.keys(config).map(lang => {
                const locale = { ...config[lang] };
                locale.lang = lang;
                locale.priority = locale.priority || 500;
                return locale;
            });

            this.prioritized = Prioritizeable.prioritizeAllSync([ ...parsedLacalesForConfig, ...this.locales ]).map(p => p.value);
        }
        return this.prioritized;
    }

}
