import { ContainerUtil } from '@celljs/core';
import * as React from 'react';
import { WidgetManager } from '@celljs/widget';
const { useState, useEffect } = React;

export function Slot({ area }: { area: string }) {
    const [nodes, setNodes] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        const load = async () => {
            const widgetManager = ContainerUtil.get<WidgetManager<React.ReactNode>>(WidgetManager);
            setNodes(await widgetManager.render(area));
        };
        load();
    }, [area]);

    return (<>{nodes.map(n => n)}</>);
}
