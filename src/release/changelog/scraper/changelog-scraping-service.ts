import { Inject, Injectable } from '@nestjs/common';
import { Release, ScrapeSettingsChangelogs } from 'src/types/supabase-custom';
import { ChangelogScraper, ParsedChangelog } from '../changelog.typedef';
import { ChangelogSanitizer } from '../sanitizer/changelog-sanitizer';

@Injectable()
export class ChangelogScrapingService {
  constructor(
    @Inject('changelogScrapers') private changelogScrapers: ChangelogScraper[],
    private changelogSanitizer: ChangelogSanitizer,
  ) {}

  async scrape(scrapeSettings: ScrapeSettingsChangelogs, release: Release): Promise<ParsedChangelog | null> {
    const matchingStrategy = this.changelogScrapers.find((it) => it.strategy === scrapeSettings.strategy);

    const changelog = await matchingStrategy!.parseChangelog(scrapeSettings, release);
    if (changelog?.changes) {
      changelog.changes = await this.changelogSanitizer.sanitize(changelog);
    }

    return changelog;
  }
}
