import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import { Blog, BlogPost, BlogPostInfo } from 'src/types/supabase-custom';
import { LanguageDetector } from './LanguageDetector';

@Injectable()
export class BlogWriter {
  private readonly logger = new Logger(BlogWriter.name);

  constructor(
    @Inject('supabaseClient') private supabaseClient: SupabaseClient<Database>,
    private languageDetector: LanguageDetector,
  ) {}

  async saveNewBlogPosts(blog: Blog, blogPosts: BlogPostInfo[]) {
    const { data: existingBlogPosts, error } = await this.supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('blog_id', blog.id)
      .in(
        'info->>guid',
        blogPosts.map((it) => it.guid),
      );

    if (error) {
      this.logger.error(error);
      return;
    }

    this.logger.log(
      'Checking ' + blogPosts.length + ' rss posts for blog ' + blog.id,
    );

    const unsavedBlogPosts = blogPosts.filter(
      (it) =>
        !existingBlogPosts.some((existing) => existing.info.guid === it.guid),
    );

    const newBlogPosts: Omit<BlogPost, 'id'>[] = [];

    for (const blogPostInfo of unsavedBlogPosts) {
      const blogPostLanguage = await this.languageDetector.detectLanguage(
        blogPostInfo.summary,
      );
      this.logger.log('Detected language for blog post', {
        blogPostLanguage,
      });

      newBlogPosts.push({
        info: blogPostInfo,
        blog_id: blog.id,
        topics: blog.topics,
        language: blogPostLanguage,
        published_at: blogPostInfo.publishedAt,
      });
    }

    this.logger.log(
      newBlogPosts.length + ' posts to insert for blog ' + blog.id,
    );

    const { error: errorInserting } = await this.supabaseClient
      .from('blog_posts')
      .insert(newBlogPosts);

    if (errorInserting) {
      this.logger.error(errorInserting);
    }
  }
}
