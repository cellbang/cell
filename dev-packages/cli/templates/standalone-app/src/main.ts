import { ApplicationFactory } from '@malagu/core/lib/common/application/application-factory';
import { ContainerUtil } from '@malagu/core';
import { AppService } from './app.service';
import AppModule from './module';

async function bootstrap() {
    const app = await ApplicationFactory.create({}, AppModule);       // 根据应用属性配置和相关的应用模块创建应用
    await app.start();                                                // 启动应用

    const appService = ContainerUtil.get<AppService>(AppService);     // 从 IoC 容器中获取指定的对象
    console.log(appService.getHello());
}

bootstrap();