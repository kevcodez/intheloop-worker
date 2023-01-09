import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { ChangelogScrapingStrategy, Release, ScrapeSettingsTweetsChangelogs } from 'src/types/supabase-custom';
import { ChangelogFormat, ChangelogScraper, ParsedChangelog } from '../changelog.typedef';

const octokit = new Octokit();

@Injectable()
export class GithubReleaseChangelogScraper implements ChangelogScraper {
  async parseChangelog(
    scrapeSettings: ScrapeSettingsTweetsChangelogs,
    release: Release,
  ): Promise<ParsedChangelog | null> {
    const ghRelease = await octokit.repos.getReleaseByTag({
      owner: scrapeSettings.meta.githubOwner!,
      repo: scrapeSettings.meta.githubRepo!,
      // @ts-ignore
      tag: release.tag!,
    });

    if (!ghRelease.data.body) {
      return null;
    }

    return {
      changes: ghRelease.data.body,
      format: ChangelogFormat.MARKDOWN,
    };
  }

  get strategy(): ChangelogScrapingStrategy {
    return 'github_release';
  }
}
