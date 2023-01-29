import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Param, Post, Query } from '@nestjs/common';
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

  @Post(':topic')
  async scrapeTweet(@Param('topic') topicId: string) {
    await this.tweetQueue.add('tweet_job', {
      topicId,
    });
  }
}
