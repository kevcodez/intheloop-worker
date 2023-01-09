# intheloop worker

Responsible for determining and executing scraping tasks. Built on Nestjs+BullMQ+Redis.

## Blog posts

A blog *may* have a RSS feed url.
If it does, the RSS feed is consumed regularly and unsaved blog posts will be saved.
The Google Translate API is used to determine the language of the blog post as we don't want to show non-english blog posts to every user.

## Popular tweets

The V1 Twitter API is used to fetch popular tweets.
The V2 Twitter API does not allow filtering by minimum favorites or replies and consumes *a lot* of quota as one has to loop through all relevant tweets.
With the V1 API, we can simply include those filters in the search query.

## Releases

Releases are fetched through NPM or Github, depending on the project.
Even though there might be relases on Github, it does not mean that the API will return all those releases, thus, we have to be careful when selecting the source for releases.

## Repositories

- [Web](https://github.com/kevcodez/intheloop) - Nuxt.js web app that powers [Intheloop](https://intheloop.dev)
- [Functions](https://github.com/kevcodez/intheloop-functions) - Firebase functions for API endpoints
- [Worker](https://github.com/kevcodez/intheloop-worker) - Nest.js+BullMQ worker for scraping data
- [Admin](https://github.com/kevcodez/intheloop-admin) - Nuxt.js admin interface for adding/editing topics
