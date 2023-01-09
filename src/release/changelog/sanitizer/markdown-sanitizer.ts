import remark from 'remark';
import { ChangelogFormat, ParsedChangelog } from '../changelog.typedef';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarkdownSanitizer {
  async sanitize(changelog: ParsedChangelog): Promise<string> {
    const tree = await remark().parse(changelog.changes);

    this.removeHeading(tree, 'Checksums');

    return remark().stringify(tree);
  }

  private removeHeading(tree: any, heading: string) {
    const idxHeading = tree.children.findIndex(
      // @ts-ignore
      (it) => it.type === 'heading' || it.children?.[0]?.value === heading,
    );

    if (idxHeading !== -1) {
      // @ts-ignore
      const nextHeading = tree.children.findIndex((it, idx) => it.type === 'heading' && idx > idxHeading);

      const endIndex = nextHeading === -1 ? tree.children.length - 1 : nextHeading;

      tree.children.splice(idxHeading, endIndex - idxHeading + 1);
    }
  }

  format(): ChangelogFormat {
    return ChangelogFormat.MARKDOWN;
  }
}
