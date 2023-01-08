import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job } from 'bullmq';
import { Database } from 'src/types/supabase';
import { ChangelogQueueData } from './typedef';

@Processor('changelog')
export class ChangelogProcessor extends WorkerHost {
  constructor(
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
  ) {
    super();
  }

  private readonly logger = new Logger(ChangelogProcessor.name);

  async process(job: Job<ChangelogQueueData, any, string>): Promise<any> {
    const releaseId = job.data.releaseId;

    const { data: release } = await this.supabaseClient
      .from('release')
      .select(`info`)
      .eq('id', releaseId)
      .single();

    // do some stuff
  }
}
