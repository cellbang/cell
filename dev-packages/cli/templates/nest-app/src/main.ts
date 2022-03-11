import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // 其他关于处理逻辑，不要调用 app.listen 方法
    return app
  }
  
export default bootstrap();
