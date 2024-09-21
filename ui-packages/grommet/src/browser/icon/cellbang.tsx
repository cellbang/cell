import * as React from 'react';
import { Blank, IconProps } from 'grommet-icons';
import { Icon } from '@celljs/react';

export function Cellbang(props: IconProps) {
    return (
        <Blank {...props}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 182 182">
                <g>
                    <rect x="0" y="20" width="30" height="138" stroke="none"/>
                    <rect x="0" y="0" width="180" height="40" rx="20" ry="20" stroke="none"/>
                    <rect x="0" y="140" width="180" height="40" rx="20" ry="20" stroke="none"/>
                    <rect x="150" y="20" width="30" height="138" stroke="none"/>
                    <rect x="90" y="80" width="80" height="40" stroke="none"/>
                </g>
            </svg>
        </Blank>
    );
}

@Icon(Cellbang)
export default class {};
