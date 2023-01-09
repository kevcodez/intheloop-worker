import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job } from 'bullmq';
import { chunk } from 'lodash';
import { Database } from 'src/types/supabase';
import { BlogQueueData } from './blog.typedef';
import { BlogWriter } from './blog-writer';
import { RssFeedParser } from './rss-feed-parser';

@Processor('blog')
export class BlogFeedProcessor extends WorkerHost {
  constructor(
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
    private blogWriter: BlogWriter,
    private rssFeedParser: RssFeedParser,
  ) {
    super();
  }

  private readonly logger = new Logger(BlogFeedProcessor.name);

  async process(job: Job<BlogQueueData, any, string>): Promise<any> {
    const blogId = job.data.blogId;

    this.logger.log('Processing blog feed job', { blogId });

    const { data: blog } = await this.supabaseClient.from('blog').select(`*`).eq('id', blogId).single();

    if (!blog) {
      this.logger.warn('Blog not found', { blogId });
      return;
    }

    const blogPosts = await this.rssFeedParser.parse(blog.info.rssFeedUrl);

    this.logger.log(`Scraped ${blogPosts.length} blog posts.`);

    // Make sure not to run in query limits with Supabase
    const chunked = chunk(blogPosts, 15);
    for (const chunk of chunked) {
      await this.blogWriter.saveNewBlogPosts(blog, chunk);
    }
  }
}
