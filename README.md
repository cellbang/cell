# WebServerless

Serverless based web development framework.

## Getting Started

```bash
npm install @malagu/cli@next -g
malagu init demo                # init template
npm install -g yarn                    # install yarn tool
yarn build                             # build project
yarn start:backend                     # start local backend for frontend
yarn start:frontend                    # start loacl frontend
yarn deploy                            # deploy project to cloud, need to configure AK with yarn config
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


