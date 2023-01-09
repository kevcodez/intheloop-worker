import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Post, Query } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ReleaseJobScheduler } from './release-job-scheduler';
import { ReleaseQueueData } from './release.typedef';

@Controller('releases')
export class ReleaseController {
  constructor(
    @InjectQueue('release') private releaseQueue: Queue<ReleaseQueueData>,
    private releaseJobScheduler: ReleaseJobScheduler,
  ) {}

  @Post()
  async scrape() {
    await this.releaseJobScheduler.scrape();
  }

  @Post()
  async scrapeBlog(@Query('topic') topicId: string) {
    await this.releaseQueue.add('release_job', {
      topicId,
    });
  }
}
