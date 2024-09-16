export const AppService = Symbol('AppService');

export interface AppInfo {
    id: string;
    name: string;
    icon: string;
    categoryId: string;
    priority: number;
    url: string;
}

export interface Category {
    id: string;
    name: string;
    priority: number;
    apps: AppInfo[];
}

export interface AppService {
    load(): Promise<Category[]>;
}
