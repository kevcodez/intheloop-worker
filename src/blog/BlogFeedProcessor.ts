import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Job } from 'bullmq';
import _ from 'lodash';
import { Database } from 'src/types/supabase';
import { BlogQueueData } from './blog.typedef';
import { BlogWriter } from './BlogWriter';
import { RssFeedParser } from './RssFeedParser';

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

    const { data: blog } = await this.supabaseClient.from('blogs').select(`*`).eq('id', blogId).single();

    if (!blog) return;

    const blogPosts = await this.rssFeedParser.parse(blog.info.rssFeedUrl);

    // Make sure not to run in query limits with Supabase
    const chunked = _.chunk(blogPosts, 15);
    for (const chunk of chunked) {
      await this.blogWriter.saveNewBlogPosts(blog, chunk);
    }
  }
}
