import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { Database } from 'src/types/supabase';
import { TweetQueueData } from './tweet.typedef';

@Injectable()
export class TweetJobScheduler {
  constructor(
    @InjectQueue('tweet') private blogQueue: Queue<TweetQueueData>,
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
  ) {}

  @Cron('20 2,9,18 * * *')
  async handleCron() {
    const { data } = await this.supabaseClient
      .from('scrape_settings')
      .select('topic_id')
      .not('tweets', 'is', null);

    this.blogQueue.addBulk(
      data.map((scrapeSettings) => ({
        data: {
          topicId: scrapeSettings.topic_id,
        },
        name: 'tweet_job',
      })),
    );
  }
}
