import { ContainerUtil, Prioritizeable } from '@malagu/core';
import { WidgetModel, WidgetFactory, Widget } from './widget-protocol';

let widgetFactories: WidgetFactory<any>[];

export namespace WidgetUtil {
    export async function create<T>(widgetModel: WidgetModel): Promise<Widget<T>> {
        if (!widgetFactories) {
            widgetFactories = Prioritizeable.prioritizeAllSync(ContainerUtil.getAll<WidgetFactory<T>>(WidgetFactory)).map(p => p.value);
        }

        for (const factory of widgetFactories) {
            if (await factory.support(widgetModel)) {
                const widget = await factory.create(widgetModel);
                return widget;
            }
        }
        throw new Error(`WidgetModel {id: ${widgetModel.id}, type: ${widgetModel.type}} there is no matching widget factory.`);
    }

    export async function render<T>(widgetModel: WidgetModel): Promise<T> {
        const widget = await WidgetUtil.create<T>(widgetModel);
        return widget.render();
    }

}
