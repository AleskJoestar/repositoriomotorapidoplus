import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlashMiddleware } from './common/middlewares/flash.middleware';
import { OldMiddleware } from './common/middlewares/old.middleware';
import { ChamadoModule } from './modules/chamado/chamado.modules';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [ChamadoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FlashMiddleware, OldMiddleware).forRoutes('*');
  }
}
