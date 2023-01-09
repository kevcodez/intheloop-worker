import { Json } from './supabase';

export type ReleaseStrategy = 'npm' | 'github';

export type ScrapeSettingsReleases = {
  via: ReleaseStrategy;
  meta: {
    repo: string;
    owner: string;
    package: string;
  };
};

export type TweetPopularitySettings = { minLikes: number; minReplies: number };
export type TweetSearch = { query: string };

export type ScrapeSettingsTweets = {
  popular: TweetPopularitySettings;
  searches: TweetSearch[];
};

export type ChangelogScrapingStrategy = 'github_release' | 'markdown_file';

export interface ScrapeSettingsTweetsChangelogs {
  strategy: ChangelogScrapingStrategy;
  meta: {
    markdownFile?: string;
    githubOwner?: string;
    githubRepo?: string;
  };
}

export type Release = {
  id: string;
  topic: string;
  published_at: string;
  info: ReleaseInfo;
};

export type ReleaseInfo = {
  version: string;
  releaseNotesUrl?: string;
} & Json;

export type Topic = {
  id: string;
  info: TopicInfo;
};

export type TopicInfo = {
  latestVersion?: string;
} & Json;

export type Blog = {
  id: string;
  topics: string[];
  info: BlogInfo;
};

export type BlogInfo = {
  rssFeedUrl: string;
} & Json;

export type BlogPost = {
  id: string;
  blog_id: string;
  info: BlogPostInfo;
  topics: string[];
  language: string;
  published_at: string;
};

export type BlogPostInfo = {
  guid: string;
  link: string;
  image?: string;
  summary: string;
  title: string;
  writtenBy: string;
  publishedAt: string;
  categories: string[];
} & Json;
