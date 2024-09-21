import * as React from 'react';
import { ContainerUtil } from '@celljs/core';
import { IconResolver } from './icon-protocol';

const { useState, useEffect } = React;

export function Icon<T>(iconProps: T) {
    const [iconNode, setIconNode] = useState<React.ReactNode>([]);

    useEffect(() => {
        const resolve = async () => {
            const iconResolver = ContainerUtil.get<IconResolver<T>>(IconResolver);
            setIconNode(await iconResolver.resolve(iconProps));
        };
        resolve();
    }, [JSON.stringify(iconProps)]);

    return (<>{iconNode}</>);
}
