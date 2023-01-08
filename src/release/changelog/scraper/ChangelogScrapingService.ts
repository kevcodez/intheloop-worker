import { Inject, Injectable } from '@nestjs/common';
import { Release, ScrapeSettingsTweetsChangelogs } from 'src/types/supabase-custom';
import { ChangelogScraper, ParsedChangelog } from '../changelog.typedef';
import { ChangelogSanitizer } from '../sanitizer/ChangelogSanitizer';

@Injectable()
export class ChangelogScrapingService {
  constructor(
    @Inject('changelogScrapers') private changelogScrapers: ChangelogScraper[],
    private changelogSanitizer: ChangelogSanitizer,
  ) {}

  async scrape(scrapeSettings: ScrapeSettingsTweetsChangelogs, release: Release): Promise<ParsedChangelog | null> {
    const matchingStrategy = this.changelogScrapers.find((it) => it.strategy === scrapeSettings.strategy);

    const changelog = await matchingStrategy!.parseChangelog(scrapeSettings, release);
    if (changelog?.changes) {
      changelog.changes = await this.changelogSanitizer.sanitize(changelog);
    }

    return changelog;
  }
}
