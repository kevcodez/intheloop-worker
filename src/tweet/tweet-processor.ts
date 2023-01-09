import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job } from 'bullmq';
import { Database } from 'src/types/supabase';
import { ScrapeSettingsTweets, TweetPopularitySettings, TweetSearch } from 'src/types/supabase-custom';
import Twitter from 'twitter-lite';
import { TweetQueueData, TwitterTweet } from './tweet.typedef';
import { TweetWriter } from './tweet-writer';

@Processor('tweet')
export class TweetProcessor extends WorkerHost {
  constructor(
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
    @Inject('twitterClientV1') private twitterClientV1: Twitter,
    private tweetWriter: TweetWriter,
  ) {
    super();
  }

  private readonly logger = new Logger(TweetProcessor.name);

  async process(job: Job<TweetQueueData, any, string>): Promise<any> {
    const topicId = job.data.topicId;

    this.logger.log('Processing tweet job', { topicId });

    const { data } = await this.supabaseClient
      .from('scrape_settings')
      .select(`tweets`)
      .eq('topic_id', topicId)
      .single();

    if (!data) {
      this.logger.warn('No scrape settings for tweets', { topicId });
      return;
    }

    const scrapeSettingsTweets = data.tweets as unknown as ScrapeSettingsTweets;

    let allTweets: TwitterTweet[] = [];

    for (const search of scrapeSettingsTweets.searches) {
      const tweets = await this.retrieveTweets(search, scrapeSettingsTweets.popular);
      allTweets = allTweets.concat(tweets);
    }

    allTweets = this.removeDuplicates(allTweets, 'id');

    await this.tweetWriter.saveNewPopularTweets(topicId, allTweets);
  }

  async retrieveTweets(search: TweetSearch, popularitySettings: TweetPopularitySettings) {
    // V2 API does not allow to filter by min favorites/replies meaning
    // we have to loop through everything and use up all the quota very quickly
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    let allTweets: TwitterTweet[] = [];
    let hasMore = true;
    let sinceId = null;

    while (hasMore) {
      const params: Record<string, any> = {
        count: 100,
        q: search.query + ` (min_faves:${popularitySettings.minLikes} OR min_replies:${popularitySettings.minReplies})`,
        since_id: sinceId,
        result_type: 'recent',
        tweet_mode: 'extended',
      };

      const baseUrl = 'search/tweets.json';
      const queryParams: string = Object.keys(params)
        .filter((it) => params[it])
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

      const fullUrl = baseUrl + '?' + queryParams;

      this.logger.log('Requesting twitter url', { fullUrl });

      const { statuses, search_metadata } = await this.twitterClientV1.get(fullUrl);
      statuses.forEach((status: any) => {
        delete status.entities;
        delete status.user.entities;
      });
      if (statuses.length !== 100) {
        hasMore = false;
      } else {
        sinceId = search_metadata.max_id;
      }
      allTweets = allTweets.concat(statuses);

      // Avoid rate limits
      new Promise((resolve) => setTimeout(resolve, 500));
    }

    return allTweets;
  }

  removeDuplicates(array: TwitterTweet[], key: keyof TwitterTweet) {
    return [...new Map(array.map((item) => [item[key], item])).values()];
  }
}
