import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import slugify from 'slugify';

async function convertBlogPosts() {
  try {
    // Read blog posts YML
    const blogPostsYml = await fs.readFile(path.join(process.cwd(), '_data', 'blog_posts.yml'), 'utf8');
    const blogPosts = yaml.load(blogPostsYml);

    // Process Medium posts
    if (blogPosts.medium_posts) {
      for (const post of blogPosts.medium_posts) {
        const slug = slugify(post.title, { lower: true, strict: true });
        const fileName = `${post.publishedAt}-${slug}.md`;
        const filePath = path.join(process.cwd(), '_blog_posts', 'medium', fileName);

        const frontMatter = {
          layout: 'post',
          title: post.title,
          date: post.publishedAt,
          categories: ['medium'],
          image: '/' + post.image,
          excerpt: post.excerpt,
          url: post.url
        };

        const content = `---\n${yaml.dump(frontMatter)}---\n`;
        await fs.writeFile(filePath, content);
        console.log(`Created Medium post: ${fileName}`);
      }
    }

    // Process Network Society posts
    if (blogPosts.network_society_posts) {
      for (const post of blogPosts.network_society_posts) {
        const slug = slugify(post.title, { lower: true, strict: true });
        const fileName = `${post.publishedAt}-${slug}.md`;
        const filePath = path.join(process.cwd(), '_blog_posts', 'network_society', fileName);

        const frontMatter = {
          layout: 'post',
          title: post.title,
          date: post.publishedAt,
          categories: ['network-society'],
          image: '/' + post.image,
          excerpt: post.excerpt,
          url: post.url
        };

        const content = `---\n${yaml.dump(frontMatter)}---\n`;
        await fs.writeFile(filePath, content);
        console.log(`Created Network Society post: ${fileName}`);
      }
    }

    console.log('Blog post conversion completed successfully!');
  } catch (error) {
    console.error('Error converting blog posts:', error);
    process.exit(1);
  }
}

export default convertBlogPosts; 