# Malagu

Web development framework.

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
└── src
    ├── browser
    │   ├── demo-frontend-module.ts
    │   └── hello-world-service.ts
    ├── common
    │   └── hello-world-protocol.ts
    └── node
        ├── demo-backend-module.ts
        └── hello-world-server.ts
```

## Defining interface

```typescript
// src/common/hello-world-protocol.ts
export const HelloWorldServer = Symbol('HelloWorldServer');

export interface HelloWorldServer {
    say(): Promise<string>;
}

```
## Defining server

```typescript
// src/node/hello-world-server.ts
import { rpc } from '@malagu/core/lib/common/annotation';
import { HelloWorldServer } from '../common/hello-world-protocol';

@rpc(HelloWorldServer)
export class HelloWorldServerImpl implements HelloWorldServer {
    say(): Promise<string> {
        return Promise.resolve('Hello world.');
    }
}
```

## Binding server

```typescript
// src/node/demo-backend-module.ts
export { HelloWorldServerImpl } from './hello-world-server';
import { buildProviderModule } from 'inversify-binding-decorators';
export default buildProviderModule()
```

## Using client proxy

```typescript
// src/browser/hello-world-service.ts
import { rpcInject, component } from '@malagu/core/lib/common/annotation';
import { HelloWorldServer } from "../common/hello-world-protocol";

@component(HelloWorldService)
export class HelloWorldService {

    constructor(
        @rpcInject(HelloWorldServer) protected readonly helloWorldServer: HelloWorldServer
    ) {}
    
}
```

## Binding service

```typescript
// src/browser/demo-frontend-module.ts
export { HelloWorldService } from './hello-world-service';
import { buildProviderModule } from 'inversify-binding-decorators';
export default buildProviderModule()
```


