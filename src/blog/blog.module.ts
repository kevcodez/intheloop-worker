import { Translate } from '@google-cloud/translate/build/src/v2';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from 'src/supabase.module';
import { BlogController } from './blog.controller';
import { BlogFeedJobScheduler } from './blog-feed-job-scheduler';
import { BlogFeedProcessor } from './blog-feed-processor';
import { BlogWriter } from './blog-writer';
import { LanguageDetector } from './language-detector';
import { RssFeedParser } from './rss-feed-parser';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'blog',
    }),
    SupabaseModule,
  ],
  providers: [
    {
      provide: 'translate',
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return new Translate({
          key: configService.get('GCLOUD_API_KEY'),
        });
      },
    },
    LanguageDetector,
    RssFeedParser,
    BlogWriter,
    BlogFeedProcessor,
    BlogFeedJobScheduler,
  ],
  controllers: [BlogController],
  exports: ['translate'],
})
export class BlogeModule {}
