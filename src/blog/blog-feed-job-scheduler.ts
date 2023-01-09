import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { Database } from 'src/types/supabase';
import { BlogQueueData } from './blog.typedef';

@Injectable()
export class BlogFeedJobScheduler {
  constructor(
    @InjectQueue('blog') private blogQueue: Queue<BlogQueueData>,
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
  ) {}

  @Cron('0 1,14 * * *')
  async scrape() {
    // Get releases without release notes
    const { data } = await this.supabaseClient.from('blog').select('id');

    this.blogQueue.addBulk(
      data.map((blog) => ({
        data: {
          blogId: blog.id,
        },
        name: 'blog_job',
      })),
    );
  }
}
