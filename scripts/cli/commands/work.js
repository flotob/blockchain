import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { NotionAPI } from '../lib/notion-api.js';
import { YAMLHandler } from '../lib/yaml.js';
import { Logger } from '../lib/logger.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

const WORK_FILE = path.join(REPO_ROOT, '_data', 'work.yml');
const SLIDES_DIR = path.join(REPO_ROOT, '_slides');
const IMAGES_DIR = path.join(REPO_ROOT, 'assets', 'images', 'notion');

export async function updateWorkSlides(options = { verbose: false }) {
  const logger = new Logger(options.verbose);
  const yaml = new YAMLHandler(REPO_ROOT);

  try {
    // Initialize Notion API
    const apiKey = process.env.NOTION_API_KEY;
    logger.debug('Checking for Notion API key...');
    if (!apiKey) {
      throw new Error('NOTION_API_KEY environment variable is not set');
    }
    logger.debug('Notion API key found');
    const notion = new NotionAPI(apiKey);

    // Read work.yml
    logger.startSpinner('Reading work data...');
    logger.debug(`Reading from ${WORK_FILE}`);
    const workData = await yaml.readYAML(WORK_FILE);
    logger.debug('Work data content:', JSON.stringify(workData, null, 2));
    logger.success('Work data loaded successfully');

    // Ensure _slides directory exists
    logger.debug(`Creating slides directory at ${SLIDES_DIR}`);
    await fs.mkdir(SLIDES_DIR, { recursive: true });

    // Process each project
    logger.debug(`Found ${workData.projects?.length || 0} projects`);
    for (const project of (workData.projects || [])) {
      logger.debug(`Processing project: ${project.title}`);
      
      if (!project.notion_source) {
        logger.debug(`Skipping ${project.title} - no Notion source`);
        continue;
      }

      logger.startSpinner(`Processing ${project.title}...`);
      logger.debug(`Notion source: ${project.notion_source}`);
      
      // Create project directories
      const projectSlidesDir = path.join(SLIDES_DIR, project.notion_source);
      const projectImagesDir = path.join(IMAGES_DIR, project.notion_source);
      
      // Clean up existing directories
      try {
        await fs.rm(projectSlidesDir, { recursive: true, force: true });
        await fs.rm(projectImagesDir, { recursive: true, force: true });
        logger.debug(`Cleaned up existing directories for ${project.title}`);
      } catch (error) {
        logger.debug(`No existing directories to clean up: ${error.message}`);
      }
      
      // Create fresh directories
      await fs.mkdir(projectSlidesDir, { recursive: true });
      await fs.mkdir(projectImagesDir, { recursive: true });

      try {
        // Get all slide pages
        logger.debug(`Fetching slides for project: ${project.notion_source}`);
        const slidePages = await notion.getSlidePages(project.notion_source);
        logger.debug(`Found ${slidePages.length} slides for ${project.title}`);

        // Process each slide
        for (const slide of slidePages) {
          logger.startSpinner(`Processing slide: ${slide.title}`);
          logger.debug(`Slide ID: ${slide.id}`);
          
          // Get slide content as markdown, passing project ID for image handling
          const markdown = await notion.getSlideContent(slide.id, project.notion_source);
          logger.debug(`Got markdown content (${markdown.length} chars)`);
          
          // Create front matter
          const frontMatter = [
            '---',
            `project: ${project.notion_source}`,
            `order: ${slide.index}`,
            `title: ${slide.title}`,
            '---',
            ''
          ].join('\n');
          
          // Create numbered filename with title
          const safeTitle = slide.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const filename = `${String(slide.index).padStart(2, '0')}_${safeTitle}.md`;
          const filepath = path.join(projectSlidesDir, filename);
          logger.debug(`Writing to: ${filepath}`);
          
          // Save markdown file with front matter
          await fs.writeFile(filepath, frontMatter + markdown, 'utf8');
          logger.success(`Saved slide: ${filename}`);
        }
        
        logger.success(`Processed ${project.title} (${slidePages.length} slides)`);
      } catch (error) {
        logger.warn(`Failed to process ${project.title}: ${error.message}`);
        logger.debug('Error details:', error);
      }
    }

    logger.success('Slides update completed');
    logger.stopSpinner();
    return true;
  } catch (error) {
    logger.error('Failed to update slides:', error);
    logger.debug('Full error:', error);
    logger.stopSpinner();
    return false;
  }
} 