export type TweetQueueData = {
  topicId: string;
};

export type TwitterTweet = {
  id: string;
  id_str: string;
  user: Record<string, any>;
  text: string;
  created_at: string;
};
