import { Controller, Get, Text } from '@celljs/mvc/lib/node';
import { ServiceA, ServiceB } from '@microservice/api';
import { Autorpc } from '@celljs/rpc';

@Controller()
export class APIController {

    @Autorpc(ServiceA)
    serviceA: ServiceA;

    @Autorpc(ServiceB)
    serviceB: ServiceB;

    @Get('/')
    @Text()
    async say(): Promise<string> {
        return 'ServiceA: ./a/say <=> ServiceB: ./b/say';
    }

    @Get('a/say')
    @Text()
    sayA(): Promise<string> {
        return this.serviceA.say();
    }

    @Get('b/say')
    @Text()
    sayB(): Promise<string> {
        return this.serviceB.say();
    }
}
