import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from 'src/supabase.module';
import { TopicModule } from 'src/topic/topic.module';
import { ChangelogJobScheduler } from './changelog/changelog-job-scheduler';
import { ChangelogProcessor } from './changelog/changelog-processor';
import { ChangelogController } from './changelog/changelog.controller';
import { ChangelogSanitizer } from './changelog/sanitizer/changelog-sanitizer';
import { MarkdownSanitizer } from './changelog/sanitizer/markdown-sanitizer';
import { ChangelogScrapingService } from './changelog/scraper/changelog-scraping-service';
import { GithubReleaseChangelogScraper } from './changelog/scraper/github-release-changelog-scraper';
import { MarkdownFileChangelogScraper } from './changelog/scraper/markdown-file-changelog-scraper';
import { ReleaseFetcherGithub } from './release-fetcher-github';
import { ReleaseFetcherNpm } from './release-fetcher-npm';
import { ReleaseJobScheduler as ReleaseJobScheduler } from './release-job-scheduler';
import { ReleaseProcessor } from './release-processor';
import { ReleaseWriter } from './release-writer';
import { ReleaseController } from './release.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'changelog',
    }),
    BullModule.registerQueue({
      name: 'release',
    }),
    SupabaseModule,
    TopicModule,
  ],

  providers: [
    ReleaseWriter,
    ReleaseJobScheduler,
    ReleaseProcessor,
    ReleaseFetcherGithub,
    ReleaseFetcherNpm,
    MarkdownSanitizer,
    ChangelogSanitizer,
    ChangelogProcessor,
    ChangelogJobScheduler,
    GithubReleaseChangelogScraper,
    MarkdownFileChangelogScraper,
    ChangelogScrapingService,
    {
      provide: 'releaseFetchers',
      useFactory: (github, npm) => [github, npm],
      inject: [ReleaseFetcherGithub, ReleaseFetcherNpm],
    },
    {
      provide: 'changelogScrapers',
      useFactory: (githubRelease, markdownFile) => [githubRelease, markdownFile],
      inject: [GithubReleaseChangelogScraper, MarkdownFileChangelogScraper],
    },
  ],

  controllers: [ReleaseController, ChangelogController],
})
export class ReleaseModule {}
