import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';

@Injectable()
export class ChangelogJobScheduler {
  private readonly logger = new Logger(ChangelogJobScheduler.name);

  constructor(
    @InjectQueue('changelog') private changelogQueue: Queue,
    @Inject('supabaseClient') private supabaseClient: SupabaseClient,
  ) {}

  @Cron('*/30 * * * * *')
  async handleCron() {
    console.log('jaja');
    this.logger.log('Called when the current second is 45');

    this.changelogQueue.add(
      'changelogjob',
      { foo: 'bar' },
      {
        removeOnComplete: true,
        removeOnFail: 3600,
      },
    );
  }
}
