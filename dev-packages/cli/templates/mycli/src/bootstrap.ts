import { ApplicationFactory } from '@celljs/core/lib/common/application/application-factory';
import { MycliModule } from './module';

export async function bootstrap() {
    const app = await ApplicationFactory.create({}, MycliModule);       // 根据应用属性配置和相关的应用模块创建应用
    await app.start();                                                  // 启动应用
}