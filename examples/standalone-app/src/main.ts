import { ApplicationFactory } from '@celljs/core/lib/common/application/application-factory';
import { ContainerUtil } from '@celljs/core';
import { AppService } from './app.service';
import AppModule from './module';

async function bootstrap() {
    const app = await ApplicationFactory.create({}, AppModule);
    await app.start();
    const appService = ContainerUtil.get<AppService>(AppService);
    console.log(appService.getHello());
}

bootstrap();