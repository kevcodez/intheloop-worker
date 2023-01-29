import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { ChangelogScrapingStrategy, Release, ScrapeSettingsChangelogs } from 'src/types/supabase-custom';
import { ChangelogFormat, ChangelogScraper, ParsedChangelog } from '../changelog.typedef';

const octokit = new Octokit();

@Injectable()
export class GithubReleaseChangelogScraper implements ChangelogScraper {
  async parseChangelog(scrapeSettings: ScrapeSettingsChangelogs, release: Release): Promise<ParsedChangelog | null> {
    let tag = release.tag;
    if (!tag && scrapeSettings.meta.tagTemplate) {
      tag = scrapeSettings.meta.tagTemplate;
      tag = tag.replace('$version', release.info.version);
    } else {
      tag = release.info.version;
    }

    try {
      const ghRelease = await octokit.rest.repos.getReleaseByTag({
        owner: scrapeSettings.meta.owner!,
        repo: scrapeSettings.meta.repo!,
        tag,
      });

      if (!ghRelease.data.body) {
        return null;
      }

      return {
        changes: ghRelease.data.body,
        format: ChangelogFormat.MARKDOWN,
      };
    } catch (err) {
      const status = err?.response.status;

      if (status === 404) {
        return null;
      } else {
        throw err;
      }
    }
  }

  get strategy(): ChangelogScrapingStrategy {
    return 'github_release';
  }
}
