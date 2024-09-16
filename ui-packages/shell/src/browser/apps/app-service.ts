import { AppService, Category, AppInfo } from '../../common';
import { Component, Prioritizeable, Value } from '@malagu/core';

@Component(AppService)
export class AppServiceImpl implements AppService {

    @Value('malagu.shell.apps')
    protected readonly apps: { [id: string]: AppInfo };

    @Value('malagu.shell.categories')
    protected readonly categories: { [id: string]: Category };

    async load(): Promise<Category[]> {
        const categoryMap = new Map<string, Category>();
        const parsedCategories = Object.keys(this.categories || {}).map(key => {
            const category = { ...this.categories[key] };
            category.id = key;
            category.priority = 500;
            category.apps = category.apps || [];
            categoryMap.set(key, category);
            return category;
        });
        const parsedApps = Object.keys(this.apps || {}).map(key => {
            const app = { ...this.apps[key] };
            app.id = key;
            app.priority = 500;
            return app;
        });
        const sortedCategories = Prioritizeable.prioritizeAllSync(parsedCategories).map(c => c.value);
        const sortedApps = Prioritizeable.prioritizeAllSync(parsedApps).map(c => c.value);
        for (const app of sortedApps) {
            const category = categoryMap.get(app.categoryId);
            if (category) {
                category.apps.push(app);
            }
        }
        return sortedCategories;
    }

}
