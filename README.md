# Malagu

Web development framework.

## Document

* [Malagu Annotaion](https://github.com/muxiangqiu/malagu/blob/master/doc/annotation.md)
* [Malagu Component](https://github.com/muxiangqiu/malagu/blob/master/doc/component.md)
* [Malagu Configuration](https://github.com/muxiangqiu/malagu/blob/master/doc/config.md)


## Getting Started

```bash
npm install @malagu/cli@next -g
npm install -g yarn
malagu init demo
malagu serve
malagu build
malagu deploy
```

## Project structure
```
.
├── package.json
├── src
│   ├── browser
│   │   ├── app.tsx
│   │   ├── frontend-module.ts
│   │   └── shell.tsx
│   ├── common
│   │   └── welcome-protocol.ts
│   └── node
│       ├── backend-module.ts
│       └── welcome-server.ts
└── tsconfig.json
```

## Defining interface

```typescript
// src/common/welcome-protocol.ts
export const WelcomeServer = Symbol('WelcomeServer');

export interface WelcomeServer {
    say(): Promise<string>;
}

```
## Defining server

```typescript
// src/node/welcome-server.ts
import { WelcomeServer } from '../common/welcome-protocol';
import { rpc } from '@malagu/core/lib/common/annotation';

@rpc(WelcomeServer)
export class WelcomeServerImpl implements WelcomeServer {
    say(): Promise<string> {
        return Promise.resolve('Welcome to Malagu');
    }
}
```

## Using Server

```typescript
// src/browser/app.tsx
import * as React from 'react';
import { autorpc } from '@malagu/core/lib/common/annotation/detached';
import { WelcomeServer } from '../common/welcome-protocol';

interface Prop {}
interface State {
    response: string
}

export class App extends React.Component<Prop, State> {

    @autorpc(WelcomeServer)
    protected welcomeServer!: WelcomeServer;

    constructor(prop: Prop) {
        super(prop);
        this.state = { response: 'Loading' };
    }

    async componentDidMount() {
        const response = await this.welcomeServer.say();
        this.setState({
            response
        });
    }

    render() {
        return <div>{this.state.response}</div>
    }
}

```