import 'reflect-metadata';
import * as http from 'http';
import { AppModule } from './app.module';
import { NestFactory } from './common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.listen(3000);
}

bootstrap();
