import { Translate } from '@google-cloud/translate/build/src/v2';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from 'src/supabase.module';
import { BlogFeedJobScheduler } from './BlogFeedJobScheduler';
import { BlogFeedProcessor } from './BlogFeedProcessor';
import { BlogWriter } from './BlogWriter';
import { LanguageDetector } from './LanguageDetector';
import { RssFeedParser } from './RssFeedParser';

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
  exports: ['translate'],
})
export class BlogeModule {}
