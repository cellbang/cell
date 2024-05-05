import { WidgetModel, WidgetFactory, Widget } from './widget-protocol';
import { WidgetUtil } from './widget-util';
import { Autowired, ExpressionHandler, Injectable } from '@malagu/core';

@Injectable()
export abstract class AbstractWidgetFactory<T> implements WidgetFactory<T> {

    @Autowired(ExpressionHandler)
    protected readonly expressionHandler: ExpressionHandler;

    priority: number = 500;

    async create(widgetModel: WidgetModel): Promise<Widget<T>> {
        const { children = [] } = widgetModel;

        return {
            id: widgetModel.id,
            visible: widgetModel.visible,
            area: widgetModel.area,
            priority: widgetModel.priority,
            render: async () => {
                if (widgetModel.props) {
                    this.expressionHandler.handle(widgetModel.props);
                }
                return this.doRender(widgetModel, await Promise.all(children.map(c => WidgetUtil.create<T>(c))));
            }
        };
    }

    async support(widgetModel: WidgetModel): Promise<boolean> {
        return this.constructor.name.startsWith(widgetModel.type);
    }

    protected abstract doRender(widgetModel: WidgetModel, children: Widget<T>[]): Promise<T>;

}
