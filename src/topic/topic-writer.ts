import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import { Topic } from 'src/types/supabase-custom';

@Injectable()
export class TopicWriter {
  private readonly logger = new Logger(TopicWriter.name);

  constructor(@Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>) {}

  async saveLatestVersion(topic: Topic, latestReleaseVersion: string) {
    if (topic.info.latestVersion === latestReleaseVersion) return;

    this.logger.log('Setting latest version', {
      topicId: topic.id,
      version: latestReleaseVersion,
    });

    const updatedInfo = {
      ...(topic.info as object),
      latestVersion: latestReleaseVersion,
    };

    const { error: errorUpdating } = await this.supabaseClient
      .from('topic')
      .update({
        info: updatedInfo,
      })
      .eq('id', topic.id);

    if (errorUpdating) {
      this.logger.error(errorUpdating);
    }
  }
}
