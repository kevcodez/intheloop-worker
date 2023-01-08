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
  // 'https://github.com/JetBrains/kotlin/releases/tag/v1.7.22',
  const changelog = await changelogScrapingService.scrape(
    {
      strategy: 'github_release',
      meta: {
        githubOwner: 'JetBrains',
        githubRepo: 'kotlin',
      },
    },
    {
      id: '123',
      version: '1.7.22',
      // @ts-ignore
      tag: 'v1.7.22',
    },
  );

  console.log(changelog);
})();
