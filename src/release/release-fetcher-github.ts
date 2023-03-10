import { Injectable, Logger } from '@nestjs/common';
import { ScrapeSettingsReleases, ReleaseStrategy } from 'src/types/supabase-custom';
import { FetchedRelease, ReleaseFetcher } from './release.typedef';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

@Injectable()
export class ReleaseFetcherGithub implements ReleaseFetcher {
  private readonly logger = new Logger(ReleaseFetcherGithub.name);

  async fetch(
    scrapeSettings: ScrapeSettingsReleases,
  ): Promise<{ releases: FetchedRelease[]; latestRelease?: string; tag?: string }> {
    const { data } = await octokit.repos.listReleases({
      owner: scrapeSettings.meta.owner,
      repo: scrapeSettings.meta.repo,
    });

    const releasesFromGithub = data.map((release) => {
      const version = release.tag_name.replace('v', '');

      return {
        name: release.name,
        publishedAt: release.published_at,
        version: version,
        releaseNotesUrl: release.html_url,
        meta: {
          prerelease: release.prerelease,
        },
        tag: release.tag_name,
      };
    });

    this.logger.log('Getting latest release', { repo: scrapeSettings.meta.repo, owner: scrapeSettings.meta.repo });

    const { data: latestRelease } = await octokit.repos.getLatestRelease({
      owner: scrapeSettings.meta.owner,
      repo: scrapeSettings.meta.repo,
    });

    const latestReleaseVersion = latestRelease.tag_name.replace('v', '');

    return {
      releases: releasesFromGithub,
      latestRelease: latestReleaseVersion,
      tag: latestRelease.tag_name,
    };
  }

  get strategy(): ReleaseStrategy {
    return 'github';
  }
}
