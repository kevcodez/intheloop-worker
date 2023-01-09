import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Post, Query } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TweetJobScheduler } from './tweet-job-scheduler';
import { TweetQueueData } from './tweet.typedef';

@Controller('tweets')
export class TweetController {
  constructor(
    @InjectQueue('tweet') private tweetQueue: Queue<TweetQueueData>,
    private tweetJobScheduler: TweetJobScheduler,
  ) {}

  @Post()
  async scrape() {
    await this.tweetJobScheduler.scrape();
  }

  @Post()
  async scrapeTweet(@Query('topic') topicId: string) {
    await this.tweetQueue.add('tweet_job', {
      topicId,
    });
  }
}
