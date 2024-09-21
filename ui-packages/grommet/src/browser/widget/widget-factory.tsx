import { Component } from '@celljs/core';
import * as React from 'react';
import { WidgetFactory, WidgetModel, AbstractWidgetFactory } from '@celljs/widget';
import { Icon } from '../icon';
import { Widget } from '@celljs/widget/lib/browser/widget/widget-protocol';
import * as widgets from './widgets';
import * as components from 'grommet';

@Component(WidgetFactory)
export class CustomWidgetFactory extends AbstractWidgetFactory<React.ReactNode> {

    override priority = 1000;

    override async support(widgetModel: WidgetModel): Promise<boolean> {
        return widgetModel.type in widgets;
    }

    protected async doRender(widgetModel: WidgetModel, children: Widget<React.ReactNode>[]): Promise<React.ReactNode> {
        const { id, type, props = {} } = widgetModel;
        const { icon, ...rest } = props;
        const W = this.doGetWidget(type);
        if (icon) {
            rest.icon = <Icon icon={icon}/>;
        }

        if (children.length) {
            rest.children = <>{(await Promise.all(children.map(c => c.render()))).map(c => c)}</>;
        }

        return (
            <W key={id} {...rest}></W>
        );
    }

    protected doGetWidget(type: string) {
        return (widgets as any)[type];
    }
}

@Component(WidgetFactory)
export class GrommetWidgetFactory extends CustomWidgetFactory {

    override priority = 900;

    override async support(widgetModel: WidgetModel): Promise<boolean> {
        return widgetModel.type in components;
    }

    protected override doGetWidget(type: string) {
        return (components as any)[type];
    }

}
