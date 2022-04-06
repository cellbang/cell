import { ApplicationFactory } from '@malagu/core/lib/common/application/application-factory';
import { ContainerUtil } from '@malagu/core';
import { AppService } from './app.service';
import AppModule from './module';

async function bootstrap() {
    const app = await ApplicationFactory.create({}, AppModule);
    await app.start();
    const appService = ContainerUtil.get<AppService>(AppService);
    console.log(appService.getHello());
}

bootstrap();