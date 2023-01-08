import { ChangelogSanitizer } from '../sanitizer/changelogSanitizer';
import { MarkdownSanitizer } from '../sanitizer/MarkdownSanitizer';
import { ChangelogScrapingService } from './changelogScrapingService';
import { GithubReleaseChangelogScraper } from './GithubReleaseChangelogScraper';
import { MarkdownFileChangelogScraper } from './MarkdownFileChangelogScraper';

const changelogScrapingService = new ChangelogScrapingService(
  [new GithubReleaseChangelogScraper(), new MarkdownFileChangelogScraper()],
  new ChangelogSanitizer(new MarkdownSanitizer()),
);

(async () => {
  const changelog = await changelogScrapingService.scrape(
    {
      strategy: 'markdown_file',
      meta: {
        markdownFile: 'https://raw.githubusercontent.com/vitejs/vite/main/packages/vite/CHANGELOG.md',
      },
    },
    {
      id: '123',
      version: '3.0.0',
      // @ts-ignore
      tag: '3.0.0',
    },
  );

  console.log(changelog);
})();
