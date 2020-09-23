import { Constant } from '@malagu/core';
import { interfaces } from 'inversify';
import { WidgetModel, WidgetType } from '../widget';

export interface WidgetOption {
    id?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[];
    rebind?: boolean;
    area: string;
    priority?: number;
    component?: any;
}

export const Widget =
    function (areaOrWidgetOption: string | WidgetOption): (target: any) => any {
        return (t: any) => {
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
