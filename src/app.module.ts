import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthController } from './app.controller';
import { BlogeModule } from './blog/blog.module';
import { ReleaseModule } from './release/release.module';
import { TopicModule } from './topic/topic.module';
import { TweetModule } from './tweet/tweet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: 3600,
        },
      }),
    }),
    TopicModule,
    ReleaseModule,
    BlogeModule,
    TweetModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
