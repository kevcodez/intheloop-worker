import * as remark from 'remark';
import { ChangelogScrapingStrategy, Release, ScrapeSettingsChangelogs } from 'src/types/supabase-custom';
import { ChangelogFormat, ChangelogScraper, ParsedChangelog } from '../changelog.typedef';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarkdownFileChangelogScraper implements ChangelogScraper {
  async parseChangelog(scrapeSettings: ScrapeSettingsChangelogs, release: Release): Promise<ParsedChangelog | null> {
    const releaseNotes = await fetch(scrapeSettings.meta.markdownFileUrl!).then((res) => res.text());

    const tree = remark().parse(releaseNotes);

    // @ts-ignore
    const children: any[] = tree.children;

    const versionHeading = children.findIndex(
      (it) => it.type === 'heading' && remark().stringify(it).includes(release.info.version),
    );
    if (versionHeading === -1) return null;

    const heading = children[versionHeading];
    const nextHeadingIdx = children.findIndex(
      // @ts-ignore
      (val, idx) => val.type === 'heading' && idx > versionHeading && val.depth <= heading.depth,
    );

    const lastIndex = nextHeadingIdx === -1 ? children.length : nextHeadingIdx;

    // @ts-ignore
    tree.children = children.splice(versionHeading + 1, lastIndex - versionHeading - 1);

    return {
      changes: remark().stringify(tree),
      format: ChangelogFormat.MARKDOWN,
    };
  }

  get strategy(): ChangelogScrapingStrategy {
    return 'markdown_file';
  }
}
