import { Component } from '@malagu/core';
import * as React from 'react';
import { AbstractWidgetFactory, WidgetFactory, WidgetModel } from '@malagu/widget';

@Component([DecoratorWidgetFactory, WidgetFactory])
export class DecoratorWidgetFactory extends AbstractWidgetFactory<React.ReactNode> {

    protected async doRender(widgetModel: WidgetModel): Promise<React.ReactNode> {
        const C = widgetModel.matedata!.component;
        return <C key={widgetModel.id} {...widgetModel.props}></C>;
    }

}
