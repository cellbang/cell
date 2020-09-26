import { Theme, ThemeManager, DEFAULT_THEME } from './theme-protocol';
import { Component, Value, Autowired, Optional, Prioritizeable } from '@malagu/core';
import { BehaviorSubject } from 'rxjs';
import { postConstruct } from 'inversify';

@Component(ThemeManager)
export class ThemeManagerImpl<T> implements ThemeManager<T> {

    protected readonly themeStorageKey = 'malagu:theme';

    @Value('malagu.themes')
    protected readonly themesForConfig: { [id: string]: Theme<T> };

    @Autowired(Theme) @Optional()
    protected readonly themes: Theme<T>[];

    protected prioritized: Theme<T>[];

    currentSubject = new BehaviorSubject<Theme<T> | undefined>(undefined);

    @postConstruct()
    init() {
        const themeStr = localStorage.getItem(this.themeStorageKey);
        if (themeStr) {
            this.currentSubject.next(JSON.parse(themeStr));
        } else {
            if (this.themesForConfig) {
                this.currentSubject.next(this.themesForConfig[DEFAULT_THEME]);
            }
        }
        this.currentSubject.subscribe(theme => {
            if (theme) {
                localStorage.setItem(this.themeStorageKey, JSON.stringify(theme));
            } else {
                localStorage.removeItem(this.themeStorageKey);
            }
        });
    }

    async get(): Promise<Theme<T>[]> {
        if (!this.prioritized) {
            const parsedThemesForConfig = Object.keys(this.themesForConfig || {}).map(id => {
                const theme = { ...this.themesForConfig[id] };
                theme.id = id;
                theme.priority = theme.priority || 500;
                return theme;
            });

            this.prioritized = Prioritizeable.prioritizeAllSync([ ...parsedThemesForConfig, ...this.themes ]).map(p => p.value);
        }
        return this.prioritized;
    }

}
