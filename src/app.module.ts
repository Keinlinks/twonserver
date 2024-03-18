import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppGateway } from './controllers/app.gateway';
import { StunServer } from './controllers/stunServer.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  providers: [AppGateway],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [StunServer],
})
export class AppModule {}
