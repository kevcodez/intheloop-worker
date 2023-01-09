import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Post, Query } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ChangelogJobScheduler } from './changelog-job-scheduler';
import { ChangelogQueueData } from './changelog.typedef';

@Controller('changelogs')
export class ChangelogController {
  constructor(
    @InjectQueue('changelog') private changelogQueue: Queue<ChangelogQueueData>,
    private changelogJobScheduler: ChangelogJobScheduler,
  ) {}

  @Post()
  async scrape() {
    await this.changelogJobScheduler.scrape();
  }

  @Post()
  async scrapeRelease(@Query('topic') topicId: string, @Query('release') releaseId: number) {
    await this.changelogQueue.add('changelog_job', {
      releaseId,
      topicId,
    });
  }
}
