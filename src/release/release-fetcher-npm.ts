import { ScrapeSettingsReleases, ReleaseStrategy } from 'src/types/supabase-custom';
import { FetchedRelease, ReleaseFetcher } from './release.typedef';
import * as npmFetch from 'npm-registry-fetch';

export class ReleaseFetcherNpm implements ReleaseFetcher {
  async fetch(scrapeSettings: ScrapeSettingsReleases): Promise<{ releases: FetchedRelease[]; latestRelease?: string }> {
    const npmData = await npmFetch.json('/' + scrapeSettings.meta.package);

    const termsToIgnore = ['0.0.0', 'canary', 'dev', 'insider'];

    const releasesFromNpm: FetchedRelease[] = Object.keys(npmData.versions)
      .filter((it) => !termsToIgnore.some((ignore) => it.includes(ignore)))
      .map((version) => {
        const versionDetails: Record<string, string> = (npmData.versions as any)[version];

        return {
          name: versionDetails.name,
          publishedAt: (npmData.time as any)[versionDetails.version],
          version: versionDetails.version,
          meta: {
            dependencies: versionDetails.dependencies,
          },
        };
      });

    const timeKeys = Object.keys(npmData.time).filter((it) => !termsToIgnore.some((ignore) => it.includes(ignore)));
    const latestReleaseVersion = timeKeys[timeKeys.length - 1];

    return {
      releases: releasesFromNpm,
      latestRelease: latestReleaseVersion,
    };
  }

  get strategy(): ReleaseStrategy {
    return 'npm';
  }
}
