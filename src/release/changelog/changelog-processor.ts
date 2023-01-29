import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job } from 'bullmq';
import { Database } from 'src/types/supabase';
import { ScrapeSettingsChangelogs } from 'src/types/supabase-custom';
import { ChangelogQueueData, ChangelogScraper } from './changelog.typedef';

@Processor('changelog')
export class ChangelogProcessor extends WorkerHost {
  constructor(
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
    @Inject('changelogScrapers') private changelogScrapers: ChangelogScraper[],
  ) {
    super();
  }

  private readonly logger = new Logger(ChangelogProcessor.name);

  async process(job: Job<ChangelogQueueData, any, string>): Promise<any> {
    const releaseId = job.data.releaseId;
    const topicId = job.data.topicId;

    this.logger.log('Processing changelog job', { topicId, releaseId });

    const { data: release } = await this.supabaseClient.from('release').select(`*`).eq('id', releaseId).single();
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

    const changelogSettings = scrapeSettings.changelogs as unknown as ScrapeSettingsChangelogs;
    const matchingScraper = this.changelogScrapers.find((it) => it.strategy === changelogSettings.strategy);
    if (!matchingScraper) {
      this.logger.warn(`No scraper found`, { strategy: changelogSettings.strategy });
      return;
    }

    try {
      const parsedChangelog = await matchingScraper.parseChangelog(changelogSettings, release);

      if (!parsedChangelog) {
        this.logger.warn('Changelog couldnt be parsed', { topicId, releaseId });
        return;
      }

      const { error } = await this.supabaseClient.from('release_changelog').upsert({
        release_id: releaseId,
        changelog: parsedChangelog.changes,
        format: parsedChangelog.format,
        created_at: new Date().toISOString(),
      });

      if (error) {
        this.logger.error(error);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }
}
