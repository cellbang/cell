import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'antd';
import { ApplicationShell } from '@malagu/core/lib/browser/application-shell';
import { component } from '@malagu/core/lib/common/annotation';
import '../../src/browser/style/app.css';
import 'antd/dist/antd.css';

@component(ApplicationShell)
export class ApplicationShellImpl implements ApplicationShell {
    attach(host: HTMLElement): void {
        ReactDOM.render(<Button>Button</Button>, host);
    }
}
