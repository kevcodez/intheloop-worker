import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Param, Post } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BlogFeedJobScheduler } from './blog-feed-job-scheduler';
import { BlogQueueData } from './blog.typedef';

@Controller('blogs')
export class BlogController {
  constructor(
    @InjectQueue('blog') private blogQueue: Queue<BlogQueueData>,
    private blogFeedJobScheduler: BlogFeedJobScheduler,
  ) {}

  @Post()
  async scrape() {
    await this.blogFeedJobScheduler.scrape();
  }

  @Post(':id')
  async scrapeBlog(@Param('id') id: string) {
    await this.blogQueue.add('blog_job', {
      blogId: id,
    });
  }
}
