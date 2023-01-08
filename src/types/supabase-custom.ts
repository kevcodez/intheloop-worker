export type ScrapeSettingsReleases = {
  via: 'npm';
  meta: {
    repo: string;
    owner: string;
    packageœ: string;
  };
};

export type ScrapeSettingsTweets = {
  popular: {
    minLikes: number;
    minReplies: number;
  };
  searches: {
    query: string;
  }[];
};
