import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { PostModule } from './post/post.module';
import { ContentItemModule } from './content-item/content-item.module';
import { ScheduleUserModule } from './schedule-user/schedule-user.module';
import typeorm from 'src/config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
      envFilePath: '.env.local',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    UsersModule,
    AuthModule,
    ScheduleModule,
    PostModule,
    ContentItemModule,
    ScheduleUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
