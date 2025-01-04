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

    // Initialize YAML handler and structure
    logger.debug('Initializing YAML handler...');
    const yamlHandler = new YAMLHandler(process.cwd());
    let blogPostsYaml;
    try {
      blogPostsYaml = await yamlHandler.readYAML('_data/blog_posts.yml');
      logger.debug('Successfully read blog_posts.yml');
    } catch (error) {
      logger.error(`Error reading blog_posts.yml: ${error}`);
      blogPostsYaml = {};
    }

    // Reset medium_archive section
    blogPostsYaml.medium_archive = [];
    logger.debug('Reset medium_archive section');

    // Process each post
    let totalProcessed = 0;
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    logger.debug(`Starting to process ${htmlFiles.length} files...`);
    for (const post of htmlFiles) {
      totalProcessed++;
      const postName = path.basename(post);
      logger.debug(`\n=== Processing post ${totalProcessed}/${htmlFiles.length}: ${postName} ===`);
      logger.startSpinner(`[${totalProcessed}/${htmlFiles.length}] Processing: ${postName}`);
      
      try {
        // Read and process HTML
        logger.debug(`Reading HTML from: ${post}`);
        const html = await fs.readFile(post, 'utf8');
        const $ = cheerio.load(html);
        
        // Extract metadata
        const title = $('h1.p-name').text() || $('h3.graf--title').text();
        const canonicalUrl = $('footer a.p-canonical').attr('href');
        const isDraft = path.basename(post).startsWith('draft_');
        logger.debug(`Metadata extracted:
          Title: ${title}
          URL: ${canonicalUrl}
          Is Draft: ${isDraft}
        `);
        
        // Get date
        let publishDate;
        if (isDraft) {
          publishDate = SATOSHI_DATE;
          logger.debug('Using Satoshi date for draft');
        } else {
          try {
            const dateFromFilename = path.basename(post).split('_')[0];
            publishDate = new Date(dateFromFilename).toISOString();
            logger.debug(`Extracted date from filename: ${publishDate}`);
          } catch (error) {
            publishDate = new Date().toISOString();
            logger.debug(`Using current date due to error: ${error}`);
          }
        }

        // Create post directory
        const postDir = path.join(mediumPostsDir, path.basename(post, '.html'));
        await fs.mkdir(postDir, { recursive: true });
        logger.debug(`Created directory: ${postDir}`);

        // Process content and get results
        logger.debug('Processing content...');
        const { content, heroImage, excerpt } = await processContentWithTimeout($, postDir);
        logger.debug(`Content processing results:
          Hero Image: ${heroImage}
          Excerpt length: ${excerpt?.length}
          Content length: ${content?.length}
        `);

        // Write markdown file
        const markdown = `---
title: ${title}
date: ${publishDate}
original_url: ${canonicalUrl || ''}
is_draft: ${isDraft}
hero_image: ${heroImage}
---

${content}`;

        const markdownPath = path.join(postDir, 'index.md');
        await fs.writeFile(markdownPath, markdown);
        logger.debug(`Wrote markdown to: ${markdownPath}`);
        
        // Add to YAML directly using our processed results
        const yamlEntry = {
          title: title || 'Untitled',
          url: canonicalUrl || '',
          image: heroImage,
          excerpt: excerpt,
          publishedAt: publishDate,
          isDraft: isDraft
        };
        logger.debug(`Adding YAML entry:
${JSON.stringify(yamlEntry, null, 2)}`);
        
        blogPostsYaml.medium_archive.push(yamlEntry);

        successCount++;
        logger.success(`[${totalProcessed}/${htmlFiles.length}] Processed: ${postName}`);
      } catch (error) {
        logger.error(`Error processing post ${postName}: ${error}`);
        errorCount++;
        continue;
      }
    }

    // Sort by date descending
    logger.debug('\n=== Finalizing YAML ===');
    blogPostsYaml.medium_archive.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    logger.debug(`Sorted ${blogPostsYaml.medium_archive.length} entries`);

    // Save YAML
    logger.debug('Writing YAML file...');
    await yamlHandler.writeYAML('_data/blog_posts.yml', blogPostsYaml);
    logger.debug('YAML file written successfully');
    
    logger.stopSpinner();
    logger.success(`Import completed:
    Total files: ${htmlFiles.length}
    Successfully processed: ${successCount}
    Errors: ${errorCount}
    Skipped: ${skipCount}
    `);

    process.exit(0);
  } catch (error) {
    logger.stopSpinner();
    logger.error(`Failed to import Medium articles: ${error}`);
    process.exit(1);
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

// Export processContent for testing
export async function processContent($, postDir) {
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
    return { content: 'No content found', heroImage: '', excerpt: '' };
  }
  
  logger.debug('Found content element, proceeding with processing');
  
  try {
    // Extract excerpt BEFORE any content modifications
    logger.debug('Extracting excerpt from original content...');
    // Find first real paragraph after introduction
    const paragraphs = article.find('p.graf--p').filter((_, el) => {
      const $el = $(el);
      // Skip if inside blockquote or is subtitle
      if ($el.closest('blockquote').length > 0) return false;
      if ($el.text().startsWith('This article was funded')) return false;
      return true;
    });
    const firstParagraph = paragraphs.first().text();
    const excerpt = firstParagraph.length > 200 
      ? firstParagraph.substring(0, 200) + '...'
      : firstParagraph;
    logger.debug(`Extracted excerpt: ${excerpt}`);

    // Remove unwanted elements
    logger.debug('Removing title...');
    article.find('h1').first().remove(); // Remove title
    
    logger.debug('Processing figures and images...');
    const imagePromises = [];
    let heroImage = '';  // Track the first image we process
    
    // First look for featured image and download it
    const featuredImg = article.find('img[data-is-featured="true"]');
    if (featuredImg.length) {
      const src = featuredImg.attr('src');
      if (src) {
        logger.debug(`Found featured image: ${src}`);
        const urlParts = src.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        const postDirName = path.basename(postDir);
        const filename = `${postDirName}-${originalFilename}`;
        heroImage = `/assets/images/medium/${filename}`;
        logger.debug(`Set hero image from featured image: ${heroImage}`);
        
        // Download featured image
        const promise = downloadImage(src, postDir);
        imagePromises.push(promise);
      }
    }
    
    // Process all figures and images
    article.find('figure').each((i, el) => {
      const img = $(el).find('img');
      const src = img.attr('src');
      if (src) {
        logger.debug(`Found image: ${src}`);
        
        // If no hero image yet, use this one
        if (!heroImage) {
          const urlParts = src.split('/');
          const originalFilename = urlParts[urlParts.length - 1];
          const postDirName = path.basename(postDir);
          const filename = `${postDirName}-${originalFilename}`;
          heroImage = `/assets/images/medium/${filename}`;
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
      return { content: 'No content found', heroImage: '', excerpt };
    }
    
    // Convert to markdown with error handling
    let markdown;
    try {
      markdown = turndownService.turndown(htmlContent);
      logger.debug(`Markdown conversion complete, length: ${markdown.length} characters`);
      
      if (!markdown) {
        logger.error('Markdown conversion resulted in empty content');
        return { content: 'Markdown conversion failed', heroImage: '', excerpt };
      }
      
      return { content: markdown, heroImage, excerpt };
    } catch (error) {
      logger.error(`Error converting to markdown: ${error}`);
      return { 
        content: `Error converting content: ${error.message}\n\nOriginal HTML:\n${htmlContent}`,
        heroImage: '',
        excerpt
      };
    }
  } catch (error) {
    logger.error(`Error in content processing: ${error}`);
    return { 
      content: `Error processing content: ${error.message}`,
      heroImage: '',
      excerpt: ''
    };
  }
} 