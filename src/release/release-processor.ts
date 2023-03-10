import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job } from 'bullmq';
import { TopicWriter } from 'src/topic/topic-writer';
import { Database } from 'src/types/supabase';
import { ScrapeSettingsReleases } from 'src/types/supabase-custom';
import { ReleaseWriter } from './release-writer';
import { ReleaseFetcher, ReleaseQueueData } from './release.typedef';

@Processor('release')
export class ReleaseProcessor extends WorkerHost {
  constructor(
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
    private releaseWriter: ReleaseWriter,
    private topicWriter: TopicWriter,
    @Inject('releaseFetchers') private releaseFetchers: ReleaseFetcher[],
  ) {
    super();
  }

  private readonly logger = new Logger(ReleaseProcessor.name);

  async process(job: Job<ReleaseQueueData, any, string>): Promise<any> {
    const topicId = job.data.topicId;

    this.logger.log('Processing release job', { topicId });

    const { data } = await this.supabaseClient
      .from('scrape_settings')
      .select(`releases`)
      .eq('topic_id', topicId)
      .single();

    if (!data) {
      this.logger.warn('Scrape settings not found for releases', { topicId });
      return;
    }

    const scrapeSettings = data.releases as unknown as ScrapeSettingsReleases;

    const matchingProvider = this.releaseFetchers.find((fetcher) => fetcher.strategy === scrapeSettings.via);

    if (!matchingProvider) {
      throw new Error(`No matching release fetcher for ${scrapeSettings.via}`);
    }

    try {
      const { releases, latestRelease } = await matchingProvider.fetch(scrapeSettings);

      this.logger.log('Fetched releases', {
        topicId,
        releases: releases.map((it) => it.version),
        latestVersion: latestRelease,
      });

      await this.releaseWriter.saveUnknownReleases(topicId, releases);

      if (latestRelease) {
        const { data: topic } = await this.supabaseClient.from('topic').select(`*`).eq('id', topicId).single();
        await this.topicWriter.saveLatestVersion(topic, latestRelease);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }
}
