import { Component } from '@celljs/core';
import * as React from 'react';
import { AbstractWidgetFactory, WidgetFactory, WidgetModel } from '@celljs/widget';

@Component(WidgetFactory)
export class DecoratorWidgetFactory extends AbstractWidgetFactory<React.ReactNode> {

    protected async doRender(widgetModel: WidgetModel): Promise<React.ReactNode> {
        const component = widgetModel.matedata!.component;
        return React.createElement(component,  { key: widgetModel.id,  ...widgetModel.props });
    }

}
