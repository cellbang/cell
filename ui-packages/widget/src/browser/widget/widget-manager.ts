import { Component, Autowired, Prioritizeable, Value, Optional } from '@celljs/core';
import { WidgetManager, WidgetModel, Widget } from './widget-protocol';
import { WidgetUtil } from './widget-util';

@Component(WidgetManager)
export class WidgetManagerImpl<T> implements WidgetManager<T> {

    protected prioritized: Map<string, Widget<T>[]>;

    constructor(
        @Autowired(Widget) @Optional() protected readonly widgets: Widget<T>[],
        @Autowired(WidgetModel) @Optional() protected readonly widgetModels: WidgetModel[],
        @Value('cell.widget.widgets') protected readonly widgetModelsForConfig: { [id: string]: WidgetModel }
    ) {}

    async render(area: string): Promise<T[]> {
        const widgets = await this.get(area);
        return Promise.all(widgets.map(w => w.render()));
    }

    async get(area: string): Promise<Widget<T>[]> {
        if (!this.prioritized) {
            const result = new Map<string, Widget<T>[]>();
            const config = { ...this.widgetModelsForConfig };
            this.widgets.forEach(w => {
                const c = config[w.id];
                if (config) {
                    w.area = c.area;
                    w.priority = c.priority === undefined ? w.priority : c.priority;
                    w.visible = c.visible === undefined ? w.visible : c.visible;
                    delete config[w.id];
                }
            });
            const parsedWdigets = await Promise.all(this.widgetModels.map(w => {
                const c = config[w.id];
                delete config[w.id];
                return WidgetUtil.create<T>({ ...w, ...c});
            }));
            const parsedWidgetsForConfig = await Promise.all((Object.keys(config).map(id => {
                const widgetModel = { ...config[id] };
                widgetModel.id = id;
                widgetModel.priority = widgetModel.priority || 500;
                widgetModel.visible = widgetModel.visible === false ? false : true;
                return WidgetUtil.create<T>(widgetModel);
            })));

            for (const widget of [ ...this.widgets, ...parsedWdigets, ...parsedWidgetsForConfig ]) {
                if (!result.has(widget.area!)) {
                    result.set(widget.area!, []);
                }
                if (widget.visible) {
                    result.get(widget!.area!)!.push(widget);
                }
            }

            for (const [ a, ws ] of result.entries()) {
                result.set(a, Prioritizeable.prioritizeAllSync(ws).map(c => c.value));
            }
            this.prioritized = result;
        }
        return this.prioritized.get(area) || [];
    }

}
