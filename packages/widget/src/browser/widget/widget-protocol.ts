export const Widget = Symbol('Widget');
export const WidgetModel = Symbol('WidgetModel');
export const WidgetFactory = Symbol('WidgetFactory');
export const WidgetManager = Symbol('WidgetManager');

export enum WidgetType {
    Decorator = 'Decorator'
}

export interface Widget<T> {
    id: string;
    priority: number;
    area?: string;
    visible: boolean;
    render(): Promise<T>;
}

export interface WidgetModel {
    id: string;
    type: string;
    priority: number;
    visible: boolean;
    area?: string;
    props?: { [key: string]: any };
    matedata?: { [key: string]: any };
    children?: WidgetModel[]
}

export interface WidgetFactory<T> {
    priority: number;
    create(widgetModel: WidgetModel): Promise<Widget<T>>;
    support(widgetModel: WidgetModel): Promise<boolean>;
}

export interface WidgetManager<T> {
    get(area: string): Promise<Widget<T>[]>;
    render(area: string): Promise<T[]>;
}
