import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import { TurndownService } from 'turndown';
import { YAMLHandler } from '../lib/yaml.js';
import { Logger } from '../lib/logger.js';
import fetch from 'node-fetch';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

export async function importMediumArticles(options = { verbose: false }) {
  const logger = new Logger(options.verbose);
  const yaml = new YAMLHandler(process.cwd());

  try {
    // Find Medium export directory
    logger.debug('Looking for Medium export directory...');
    const exportDirs = await glob('import/medium-export-*');
    if (exportDirs.length === 0) {
      throw new Error('No Medium export directory found in import/');
    }
    const exportDir = exportDirs[0];
    logger.success(`Found export directory: ${exportDir}`);

    // Find all posts
    const postsDir = path.join(exportDir, 'posts');
    const posts = await glob('*.html', { cwd: postsDir });
    logger.debug(`Found ${posts.length} posts`);

    // Create medium posts directory if it doesn't exist
    const mediumDir = '_blog_posts/medium';
    await fs.mkdir(mediumDir, { recursive: true });
    logger.debug(`Ensuring directory exists: ${mediumDir}`);

    // Array to collect all processed posts
    const mediumPosts = [];

    // Process each post
    for (const post of posts) {
      logger.startSpinner(`Processing ${post}...`);
      
      // Read post HTML
      const html = await fs.readFile(path.join(postsDir, post), 'utf8');
      const $ = cheerio.load(html);
      
      // Extract metadata
      const metadata = {
        title: $('h1.p-name').text(),
        date: $('time.dt-published').attr('datetime'),
        original_url: $('link.p-canonical').attr('href'),
        is_draft: post.startsWith('draft_'),
        article_id: path.basename(post, '.html')
      };
      logger.debug('Extracted metadata:', metadata);

      // Create article directory
      const articleDir = path.join(mediumDir, metadata.article_id);
      const imagesDir = path.join(articleDir, 'images');
      await fs.mkdir(imagesDir, { recursive: true });
      logger.debug(`Created directory: ${articleDir}`);

      // Process content and download images
      const content = await processContent($, articleDir, logger);
      logger.debug('Processed content and downloaded images');

      // Generate and save markdown
      const markdown = generateMarkdown(metadata, content);
      await fs.writeFile(path.join(articleDir, 'index.md'), markdown);
      logger.debug('Saved markdown file');

      // Add to posts array
      mediumPosts.push({
        title: metadata.title,
        url: metadata.original_url,
        image: `images/blog/blog-${metadata.article_id}.jpg`,
        excerpt: extractFirstParagraph(content) || "No excerpt available.",
        publishedAt: metadata.date.split('T')[0],
        is_draft: metadata.is_draft
      });

      logger.success(`Processed ${post}`);
    }

    // Sort posts by date descending
    mediumPosts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Write all posts to YAML at once
    const blogPosts = {
      medium_posts: mediumPosts
    };
    await yaml.writeYAML('_data/blog_posts.yml', blogPosts);
    logger.success('Updated blog_posts.yml with all Medium posts');

    logger.success('Medium import completed successfully');
    return true;
  } catch (error) {
    logger.error('Failed to import Medium articles:', error);
    return false;
  }
}

async function processContent($, articleDir, logger) {
  const article = $('article.h-entry');
  const content = article.find('section[data-field="body"]');
  
  // Process images
  const images = content.find('img');
  logger.debug(`Found ${images.length} images`);
  
  for (const img of images) {
    const $img = $(img);
    const src = $img.attr('src');
    if (!src || src.startsWith('data:')) continue;

    try {
      const filename = path.basename(src).split('?')[0]; // Remove query params
      const imagePath = path.join(articleDir, 'images', filename);
      
      // Download image
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      const buffer = await response.buffer();
      
      // Save locally
      await fs.writeFile(imagePath, buffer);
      
      // Update src to local path
      $img.attr('src', `images/${filename}`);
      logger.debug(`Downloaded image: ${filename}`);
    } catch (error) {
      logger.warn(`Failed to process image ${src}:`, error);
    }
  }

  // Convert to markdown
  return turndownService.turndown(content.html());
}

function generateMarkdown(metadata, content) {
  const frontMatter = [
    '---',
    `title: "${metadata.title}"`,
    `date: ${metadata.date}`,
    `is_draft: ${metadata.is_draft}`,
    `original_url: ${metadata.original_url}`,
    'type: medium',
    '---',
    '',
    content
  ].join('\n');

  return frontMatter;
}

// Helper to extract first paragraph for excerpt
function extractFirstParagraph(content) {
  const match = content.match(/^[^\n]+/);
  return match ? match[0].slice(0, 200) + '...' : null;
} 