import {
  ChangelogScrapingStrategy,
  Release,
  ScrapeSettingsTweetsChangelogs,
} from 'src/types/supabase-custom';

export interface ChangelogScraper {
  parseChangelog(
    scrapeSettings: ScrapeSettingsTweetsChangelogs,
    release: Release,
  ): Promise<ParsedChangelog | null>;

  get strategy(): ChangelogScrapingStrategy;
}

export interface ParsedChangelog {
  changes: string;
  format: ChangelogFormat;
  releaseNotesUrl?: string;
}

export enum ChangelogFormat {
  MARKDOWN = 'markdown',
}

export type ChangelogQueueData = {
  releaseId: number;
  topicId: string;
};
