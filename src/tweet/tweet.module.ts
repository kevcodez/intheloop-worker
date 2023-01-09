import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from 'src/supabase.module';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Twitter = require('twitter-lite');
import { TweetJobScheduler } from './tweet-job-scheduler';
import { TweetProcessor } from './tweet-processor';
import { TweetWriter } from './tweet-writer';
import { TweetController } from './tweet.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'tweet',
    }),
    SupabaseModule,
  ],
  providers: [
    {
      provide: 'twitterClientV1',
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return new Twitter({
          version: '1.1',
          extension: false,
          consumer_key: configService.get('TWITTER_CONSUMER_KEY'),
          consumer_secret: configService.get('TWITTER_CONSUMER_SECRET'),
          bearer_token: configService.get('TWITTER_BEARER_TOKEN'),
        });
      },
    },
    TweetWriter,
    TweetJobScheduler,
    TweetProcessor,
  ],
  controllers: [TweetController],
})
export class TweetModule {}
