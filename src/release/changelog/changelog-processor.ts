import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job } from 'bullmq';
import { Database } from 'src/types/supabase';
import { ChangelogQueueData } from './changelog.typedef';

@Processor('changelog')
export class ChangelogProcessor extends WorkerHost {
  constructor(@Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>) {
    super();
  }

  private readonly logger = new Logger(ChangelogProcessor.name);

  async process(job: Job<ChangelogQueueData, any, string>): Promise<any> {
    const releaseId = job.data.releaseId;
    const topicId = job.data.topicId;

    this.logger.log('Processing changelog job', { topicId, releaseId });

    const { data: release } = await this.supabaseClient.from('release').select(`info`).eq('id', releaseId).single();
    const { data: scrapeSettings } = await this.supabaseClient
      .from('scrape_settings')
      .select(`*`)
      .eq('topic_id', topicId)
      .single();

    if (!release) {
      this.logger.warn('No release found', { releaseId, topicId });
      return;
    }

    if (!scrapeSettings) {
      this.logger.warn('No scrape settings found for changelogs', { releaseId, topicId });
      return;
    }

    // do some stuff
  }
}
