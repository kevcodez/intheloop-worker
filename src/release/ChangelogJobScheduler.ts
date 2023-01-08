import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { Database } from 'src/types/supabase';
import { ChangelogQueueData } from './typedef';

@Injectable()
export class ChangelogJobScheduler {
  private readonly logger = new Logger(ChangelogJobScheduler.name);

  constructor(
    @InjectQueue('changelog') private changelogQueue: Queue<ChangelogQueueData>,
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
  ) {}

  @Cron('*/30 * * * * *')
  async handleCron() {
    // Get releases without release notes
    const { data } = await this.supabaseClient
      .from('release')
      .select(
        `
        id,
        topic,
        release_changelog(release_id)
    `,
      )
      .is('release_changelog.release_id', null)
      .limit(25);

    this.changelogQueue.addBulk(
      data.map((release) => ({
        data: {
          releaseId: release.id,
          topicId: release.topic,
        },
        name: 'changelog_job',
        opts: {
          removeOnComplete: true,
          removeOnFail: 3600,
        },
      })),
    );
  }
}
