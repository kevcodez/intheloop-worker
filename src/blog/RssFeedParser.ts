import { Injectable } from '@nestjs/common';
import * as Parser from 'rss-parser';
import { load } from 'cheerio';

const parser = new Parser({
  customFields: {
    item: ['description', 'id'],
  },
});

@Injectable()
export class RssFeedParser {
  async parse(feedUrl: string) {
    const feed = await parser.parseURL(feedUrl);

    return feed.items.map((item: any) => {
      const summary = item.description || item.summary || item.content;

      return {
        title: item.title,
        link: item.link,
        image: this.getImageUrl(summary) || null,
        publishedAt: item.isoDate, // pubDate
        writtenBy: item.creator || item.author,
        guid: item.guid || item.id,
        summary,
        categories: item.categories || [],
      };
    });
  }

  getImageUrl(description: string) {
    if (!description) {
      return null;
    }
    const $ = load(description);

    return $('img').attr('src');
  }
}
