import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { Database } from 'src/types/supabase';
import { ReleaseQueueData } from './release.typedef';

@Injectable()
export class ReleaseJobScheduler {
  private readonly logger = new Logger(ReleaseJobScheduler.name);

  constructor(
    @InjectQueue('release') private releaseQueue: Queue<ReleaseQueueData>,
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
  ) {}

  @Cron('15 1,5,9,14,19 * * *')
  async scrape() {
    // Get releases without release notes
    const { data } = await this.supabaseClient.from('topic').select('id');

    this.releaseQueue.addBulk(
      data.map((topic) => ({
        data: {
          topicId: topic.id,
        },
        name: 'release_job',
      })),
    );
  }
}
