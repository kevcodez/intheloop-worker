import { ReleaseStrategy, ScrapeSettingsReleases } from 'src/types/supabase-custom';

export type ReleaseQueueData = {
  topicId: string;
};

export interface ReleaseFetcher {
  fetch(scrapeSettings: ScrapeSettingsReleases): Promise<{ releases: FetchedRelease[]; latestRelease?: string }>;

  get strategy(): ReleaseStrategy;
}

export type FetchedRelease = {
  name: string;
  publishedAt: string;
  version: string;
  meta: Record<string, any>;
  tag?: string;
};
