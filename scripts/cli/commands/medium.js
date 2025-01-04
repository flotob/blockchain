import path from 'path';
import fs from 'fs/promises';
import TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import globPkg from 'glob';
import { promisify } from 'util';
const globPromise = promisify(globPkg);
import { Logger } from '../lib/logger.js';
import { YAMLHandler } from '../lib/yaml.js';
import fetch from 'node-fetch';

// Initialize logger in verbose mode
const logger = new Logger(true);
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Bitcoin whitepaper publication date for drafts
const SATOSHI_DATE = '2008-10-31T00:00:00.000Z';

async function processContentWithTimeout($, postDir, timeout = 30000) {
  return Promise.race([
    processContent($, postDir),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Content processing timed out')), timeout)
    )
  ]);
}

export async function importMediumArticles() {
  try {
    // Find Medium export directory
    logger.debug('Looking for Medium export directory...');
    const pattern = path.join(process.cwd(), 'import/medium-export-*');
    logger.debug(`Glob pattern: ${pattern}`);
    const exportDirs = await globPromise(pattern);
    logger.debug(`Found directories: ${JSON.stringify(exportDirs)}`);
    if (exportDirs.length === 0) {
      throw new Error('No Medium export directory found in import/');
    }
    const exportDir = exportDirs[0];
    logger.success(`Found export directory: ${exportDir}`);

    // Find HTML files
    const postsDir = path.join(exportDir, 'posts');
    logger.debug(`Looking for HTML files in: ${postsDir}`);
    const htmlPattern = path.join(postsDir, '*.html');
    logger.debug(`HTML glob pattern: ${htmlPattern}`);
    const htmlFiles = await globPromise(htmlPattern);
    logger.debug(`Found HTML files: ${JSON.stringify(htmlFiles)}`);
    if (htmlFiles.length === 0) {
      throw new Error('No HTML files found in posts directory');
    }
    logger.debug(`Found ${htmlFiles.length} HTML files in ${postsDir}`);

    // Create medium posts directory if it doesn't exist
    const mediumPostsDir = '_blog_posts/medium';
    
    // Clean up existing medium posts directory
    try {
      await fs.rm(mediumPostsDir, { recursive: true, force: true });
      logger.debug('Cleaned up existing medium posts directory');
    } catch (error) {
      logger.debug('No existing medium posts directory to clean up');
    }
    
    // Create fresh directory
    await fs.mkdir(mediumPostsDir, { recursive: true });
    logger.debug(`Created directory: ${mediumPostsDir}`);

    // Process each post
    let totalProcessed = 0;
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    logger.debug(`Starting to process ${htmlFiles.length} files...`);
    for (const post of htmlFiles) {
      totalProcessed++;
      const postName = path.basename(post);
      logger.startSpinner(`[${totalProcessed}/${htmlFiles.length}] Processing: ${postName}`);
      
      try {
        // Read post HTML
        logger.debug(`Reading HTML file: ${postName}`);
        const html = await fs.readFile(post, 'utf8');
        logger.debug(`Read ${html.length} characters from file`);
        
        const $ = cheerio.load(html);
        logger.debug('Loaded HTML with cheerio');
        
        // Extract metadata with detailed logging
        logger.debug('Extracting metadata...');
        
        // Get title from h1 or h3
        const title = $('h1.p-name').text() || $('h3.graf--title').text();
        logger.debug(`Found title: ${title}`);
        
        // Get canonical URL from footer's canonical link
        const canonicalUrl = $('footer a.p-canonical').attr('href');
        logger.debug(`Found canonical URL: ${canonicalUrl}`);
        
        // Determine if it's a draft
        const isDraft = path.basename(post).startsWith('draft_');
        
        // Get date from filename for published posts, use Satoshi date for drafts
        let publishDate;
        if (isDraft) {
          publishDate = SATOSHI_DATE;
          logger.debug('Draft post, using Satoshi date');
        } else {
          try {
            const dateFromFilename = path.basename(post).split('_')[0];
            publishDate = new Date(dateFromFilename).toISOString();
            logger.debug(`Extracted date from filename: ${publishDate}`);
          } catch (error) {
            logger.error(`Error parsing date from filename, using current date: ${error}`);
            publishDate = new Date().toISOString();
          }
        }
        
        const metadata = {
          title,
          date: publishDate,
          original_url: canonicalUrl || '',
          is_draft: isDraft,
          article_id: path.basename(post, '.html')
        };
        logger.debug(`Extracted metadata: ${JSON.stringify(metadata, null, 2)}`);

        // Create directory for post
        const postDir = path.join(mediumPostsDir, metadata.article_id);
        await fs.mkdir(postDir, { recursive: true });
        logger.debug(`Created directory for post: ${postDir}`);

        // Process content with timeout
        logger.debug('Processing content...');
        logger.updateSpinner(`[${totalProcessed}/${htmlFiles.length}] Converting content: ${postName}`);
        const { content, heroImage } = await processContentWithTimeout($, postDir);
        logger.debug(`Processed content length: ${content.length} characters`);
        logger.debug(`Hero image path: ${heroImage}`);

        // Create markdown file
        const markdown = `---
title: ${metadata.title}
date: ${metadata.date || new Date().toISOString()}
original_url: ${metadata.original_url || ''}
is_draft: ${metadata.is_draft}
hero_image: ${heroImage}
---

${content}`;

        const markdownPath = path.join(postDir, 'index.md');
        await fs.writeFile(markdownPath, markdown);
        logger.debug(`Saved markdown file: ${markdownPath}`);
        successCount++;
        logger.success(`[${totalProcessed}/${htmlFiles.length}] Processed: ${postName}`);
      } catch (error) {
        logger.error(`Error processing post ${postName}: ${error}`);
        errorCount++;
        logger.updateSpinner(`[${totalProcessed}/${htmlFiles.length}] Failed: ${postName}`);
        continue;
      }
    }

    logger.stopSpinner();
    logger.success(`Import summary:
    Total files: ${htmlFiles.length}
    Successfully processed: ${successCount}
    Errors: ${errorCount}
    Skipped: ${skipCount}
    `);

    // Update blog_posts.yml
    logger.debug('Starting YAML update process...');
    const yamlHandler = new YAMLHandler(process.cwd());
    
    // Read existing YAML with error handling
    let blogPostsYaml;
    try {
      logger.debug('Reading existing blog_posts.yml...');
      blogPostsYaml = await yamlHandler.readYAML('_data/blog_posts.yml');
      logger.debug('Successfully read blog_posts.yml');
    } catch (error) {
      logger.error(`Error reading blog_posts.yml: ${error}`);
      blogPostsYaml = {}; // Start with empty object if file doesn't exist
    }

    // Add medium_archive section if it doesn't exist
    if (!blogPostsYaml.medium_archive) {
      logger.debug('Creating medium_archive section');
      blogPostsYaml.medium_archive = [];
    } else {
      logger.debug(`Found existing medium_archive with ${blogPostsYaml.medium_archive.length} entries`);
      // Clear existing entries
      blogPostsYaml.medium_archive = [];
      logger.debug('Cleared existing medium_archive entries');
    }

    // Add imported posts
    const importPattern = path.join(mediumPostsDir, '**/index.md');
    logger.debug(`Looking for imported posts with pattern: ${importPattern}`);
    const importedPosts = await globPromise(importPattern);
    logger.debug(`Found ${importedPosts.length} imported posts to process`);

    let yamlProcessedCount = 0;
    let yamlErrorCount = 0;
    for (const post of importedPosts) {
      logger.debug(`Processing imported post ${yamlProcessedCount + 1}/${importedPosts.length}: ${post}`);
      
      try {
        const content = await fs.readFile(post, 'utf8');
        logger.debug(`Read ${content.length} characters from ${post}`);
        
        const parts = content.split('---').filter(Boolean);
        if (parts.length < 2) {
          logger.debug(`Skipping malformed post: ${post} (invalid front matter)`);
          yamlErrorCount++;
          continue;
        }
        
        // Parse front matter
        const frontMatter = parts[0].trim();
        const metadata = frontMatter.split('\n')
          .filter(line => line.trim().length > 0)
          .reduce((acc, line) => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              const value = valueParts.join(':').trim();
              // Remove quotes if present
              acc[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
            return acc;
          }, {});

        logger.debug(`Parsed metadata: ${JSON.stringify(metadata, null, 2)}`);

        // Generate excerpt from content
        const contentText = parts[1] || '';
        const firstParagraph = contentText
          .split('\n')
          .map(line => line.trim())
          .find(line => line.length > 0 && !line.startsWith('#')) || '';
        const excerpt = firstParagraph.length > 200 
          ? firstParagraph.substring(0, 200) + '...'
          : firstParagraph;

        // Verify image exists before adding to YAML
        let imagePath = '';
        if (metadata.hero_image) {
          const fullImagePath = path.join(process.cwd(), metadata.hero_image.replace(/^\//, ''));
          try {
            await fs.access(fullImagePath);
            imagePath = metadata.hero_image;
          } catch (error) {
            logger.debug(`Hero image not found at ${fullImagePath}, skipping`);
          }
        }

        // Add to blog_posts.yml
        blogPostsYaml.medium_archive.push({
          title: metadata.title || 'Untitled',
          url: metadata.original_url || '',
          image: imagePath,  // Only use path if file exists
          excerpt: excerpt,
          publishedAt: metadata.date,
          isDraft: metadata.is_draft === 'true'
        });
        logger.debug(`Added post to blog_posts.yml: ${metadata.title}`);
        yamlProcessedCount++;
      } catch (error) {
        logger.error(`Error processing post ${post}: ${error}`);
        yamlErrorCount++;
        continue;
      }
    }

    logger.debug(`YAML processing summary:
    Total files: ${importedPosts.length}
    Successfully processed: ${yamlProcessedCount}
    Errors: ${yamlErrorCount}
    `);

    // Sort by date descending
    blogPostsYaml.medium_archive.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    logger.debug('Sorted medium_archive posts by date');

    // Save blog_posts.yml
    try {
      logger.debug('Writing updated blog_posts.yml...');
      await yamlHandler.writeYAML('_data/blog_posts.yml', blogPostsYaml);
      logger.success('Updated blog_posts.yml');
    } catch (error) {
      logger.stopSpinner(); // Stop spinner before throwing
      logger.error(`Error writing blog_posts.yml: ${error}`);
      throw error;
    }

    logger.stopSpinner(); // Ensure spinner is stopped before finishing
    logger.success('Medium import completed successfully');
    process.exit(0); // Explicitly exit

  } catch (error) {
    logger.stopSpinner(); // Stop spinner in case of error
    logger.error(`Failed to import Medium articles: ${error}`);
    process.exit(1); // Exit with error code
  }
}

async function downloadImage(url, postDir) {
  try {
    logger.debug(`Downloading image from ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Referer': 'https://medium.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    // Extract filename from URL and make it unique using the post directory name
    const urlParts = url.split('/');
    const originalFilename = urlParts[urlParts.length - 1];
    const postDirName = path.basename(postDir);
    // Prepend post directory name to ensure uniqueness
    const filename = `${postDirName}-${originalFilename}`;
    
    // Create assets/images/medium directory if it doesn't exist
    const imageDir = path.join(process.cwd(), 'assets', 'images', 'medium');
    await fs.mkdir(imageDir, { recursive: true });
    
    const imagePath = path.join(imageDir, filename);
    const buffer = await response.buffer();
    await fs.writeFile(imagePath, buffer);
    
    logger.debug(`Saved image to ${imagePath}`);
    // Return path relative to site root for use in markdown and YAML
    return path.join('/assets/images/medium', filename);
  } catch (error) {
    logger.error(`Error downloading image ${url}: ${error}`);
    return null; // Return null instead of falling back to URL
  }
}

async function processContent($, postDir) {
  logger.debug('Starting content processing...');
  
  // Extract article content
  logger.debug('Looking for content element...');
  let article = $('article').first();
  logger.debug(`Found article element: ${article.length > 0}`);
  
  if (!article.length) {
    logger.debug('No article element found, trying main content');
    article = $('main').first();
    logger.debug(`Found main element: ${article.length > 0}`);
    
    if (!article.length) {
      logger.debug('No main element found, using body');
      article = $('body');
      logger.debug(`Using body element: ${article.length > 0}`);
    }
  }
  
  if (!article.length) {
    logger.error('No content element found at all');
    return { content: 'No content found', heroImage: '' };
  }
  
  logger.debug('Found content element, proceeding with processing');
  
  try {
    // Remove unwanted elements
    logger.debug('Removing title...');
    article.find('h1').first().remove(); // Remove title
    
    logger.debug('Processing figures and images...');
    const imagePromises = [];
    let heroImage = '';  // Track the first image we process
    let foundFirstImage = false;  // Track if we've found the first image
    
    article.find('figure').each((i, el) => {
      const img = $(el).find('img');
      const src = img.attr('src');
      if (src) {
        logger.debug(`Found image: ${src}`);
        
        // Set hero image to first image found, regardless of download status
        if (!foundFirstImage) {
          foundFirstImage = true;
          const urlParts = src.split('/');
          const originalFilename = urlParts[urlParts.length - 1];
          const postDirName = path.basename(postDir);
          const filename = `${postDirName}-${originalFilename}`;
          heroImage = path.join('/assets/images/medium', filename);
          logger.debug(`Set hero image: ${heroImage}`);
        }
        
        // Download image and replace with local path
        const promise = downloadImage(src, postDir).then(localPath => {
          $(el).replaceWith(`![](${localPath || src})`); // Use original URL in content if download failed
        });
        imagePromises.push(promise);
      } else {
        logger.debug('Found figure without image, removing');
        $(el).remove();
      }
    });

    // Wait for all images to be downloaded
    await Promise.all(imagePromises);

    logger.debug('Converting to markdown...');
    // Get HTML content before conversion
    const htmlContent = article.html() || '';
    logger.debug(`HTML content length: ${htmlContent.length} characters`);
    
    if (!htmlContent) {
      logger.error('No HTML content found');
      return { content: 'No content found', heroImage: '' };
    }
    
    // Convert to markdown with error handling
    let markdown;
    try {
      markdown = turndownService.turndown(htmlContent);
      logger.debug(`Markdown conversion complete, length: ${markdown.length} characters`);
      
      if (!markdown) {
        logger.error('Markdown conversion resulted in empty content');
        return { content: 'Markdown conversion failed', heroImage: '' };
      }
      
      return { content: markdown, heroImage };
    } catch (error) {
      logger.error(`Error converting to markdown: ${error}`);
      return { 
        content: `Error converting content: ${error.message}\n\nOriginal HTML:\n${htmlContent}`,
        heroImage: ''
      };
    }
  } catch (error) {
    logger.error(`Error in content processing: ${error}`);
    return { 
      content: `Error processing content: ${error.message}`,
      heroImage: ''
    };
  }
} 