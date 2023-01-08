import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import _ from 'lodash';
import { Release, ReleaseInfo } from 'src/types/supabase-custom';
import { FetchedRelease } from './release.typedef';

@Injectable()
export class ReleaseWriter {
  private readonly logger = new Logger(ReleaseWriter.name);

  constructor(@Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>) {}

  async saveUnknownReleases(topicId: string, fetchedReleases: FetchedRelease[]) {
    this.logger.log('Fetched releases', {
      topicId,
      releases: fetchedReleases.map((it) => it.version),
    });

    const releasesFromSupabase: { info: ReleaseInfo }[] = [];

    // Need to chunk for Supabase
    const versionChunks = _.chunk(
      fetchedReleases.map((it) => it.version),
      100,
    );

    for (const versions of versionChunks) {
      const { data, error } = await this.supabaseClient
        .from('release')
        .select('info')
        .eq('topic', topicId)
        .in('info->>version', versions);

      releasesFromSupabase.push(...data);

      if (error) throw error;
    }

    const releasesNotInDatabaseYet = fetchedReleases.filter(
      (release) => !releasesFromSupabase.some((it) => it.info.version === release.version),
    );

    if (releasesNotInDatabaseYet.length) {
      this.logger.log('Saving new releases', {
        releasesInSupabase: releasesFromSupabase.length,
        releasesNotInDatabase: releasesNotInDatabaseYet.length,
      });
    }

    const releasesToInsert: Omit<Release, 'id'>[] = releasesNotInDatabaseYet.map((release) => ({
      info: {
        meta: release.meta,
        name: release.name,
        version: release.version,
        publishedAt: release.publishedAt,
      },
      name: release.name,
      published_at: release.publishedAt,
      topic: topicId,
      version: release.version,
    }));

    const { error: errorInserting } = await this.supabaseClient.from('release').insert(releasesToInsert);

    if (errorInserting) {
      this.logger.error(errorInserting);
    }
  }
}
