import { ComponentId, Constant } from '@malagu/core';
import { WidgetModel, WidgetType } from '../widget';

export interface WidgetOption {
    id?: ComponentId | ComponentId[];
    rebind?: boolean;
    area: string;
    priority?: number;
    component?: any;
}

export const Widget =
    function (areaOrWidgetOption: string | WidgetOption): ClassDecorator {
        return t => {
            let widgetOption: WidgetOption;
            if (typeof areaOrWidgetOption === 'string') {
                widgetOption = { area: areaOrWidgetOption };
            } else {
                widgetOption = { ...areaOrWidgetOption };
            }
            const id = widgetOption.id || [];
            const component = widgetOption.component || t;
            Constant([...id, component, WidgetModel], {
                id: widgetOption.id ? widgetOption.id.toString() : component.name,
                visible: true,
                type: WidgetType.Decorator,
                priority: widgetOption.priority || 500,
                area: widgetOption.area,
                matedata: {
                    component
                }
            }, widgetOption.rebind)(t);
        };
    };
