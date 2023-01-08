import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import { TwitterTweet } from './tweet.typedef';

@Injectable()
export class TweetWriter {
  private readonly logger = new Logger(TweetWriter.name);

  constructor(
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
  ) {}

  async saveNewPopularTweets(topicId: string, tweets: TwitterTweet[]) {
    const tweetIds = tweets.map((it) => it.id_str);

    const { data: existingTweets, error } = await this.supabaseClient
      .from('tweets')
      .select('id')
      .in('id', tweetIds);

    if (error) {
      this.logger.error(error);
      throw error;
    }

    const existingTweetsIds = existingTweets.map((it) => it.id);

    const nonExistingTweets = tweets.filter(
      (it) => !existingTweetsIds.includes(it.id_str),
    );

    this.logger.log(`Saving ${nonExistingTweets.length} new tweets`);

    const tweetsToSave = nonExistingTweets.map((tweet) => {
      return {
        id: tweet.id_str,
        topics: [topicId],
        info: {
          id: tweet.id_str,
          authorId: tweet.user.id,
          text: tweet.text,
          createdAt: tweet.created_at,
          author: tweet.user,
        },
        created_at: tweet.created_at,
      };
    });

    if (tweetsToSave.length) {
      this.logger.log('Inserting tweets', {
        tweetSize: tweetsToSave.length,
      });
    }

    const { error: errorInserting } = await this.supabaseClient
      .from('tweets')
      .insert(tweetsToSave);

    if (errorInserting) {
      this.logger.error(errorInserting);
      throw errorInserting;
    }
  }
}
