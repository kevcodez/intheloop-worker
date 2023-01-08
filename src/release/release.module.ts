import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from 'src/supabase.module';
import { TopicModule } from 'src/topic/topic.module';
import { ChangelogJobScheduler } from './changelog/ChangelogJobScheduler';
import { ChangelogProcessor } from './changelog/ChangelogProcessor';
import { ChangelogSanitizer } from './changelog/sanitizer/ChangelogSanitizer';
import { MarkdownSanitizer } from './changelog/sanitizer/MarkdownSanitizer';
import { ChangelogScrapingService } from './changelog/scraper/ChangelogScrapingService';
import { GithubReleaseChangelogScraper } from './changelog/scraper/GithubReleaseChangelogScraper';
import { MarkdownFileChangelogScraper } from './changelog/scraper/MarkdownFileChangelogScraper';
import { ReleaseFetcherGithub } from './ReleaseFetcherGithub';
import { ReleaseFetcherNpm } from './ReleaseFetcherNpm';
import { ReleaseJobScheduler as ReleaseJobScheduler } from './ReleaseJobScheduler';
import { ReleaseProcessor } from './ReleaseProcessor';
import { ReleaseWriter } from './ReleaseWriter';

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
})
export class ReleaseModule {}
