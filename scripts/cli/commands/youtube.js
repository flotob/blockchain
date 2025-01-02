import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { YouTubeAPI } from '../lib/youtube-api.js';
import { YAMLHandler } from '../lib/yaml.js';
import { Logger } from '../lib/logger.js';

console.log('YouTube command module loaded');

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

console.log('REPO_ROOT:', REPO_ROOT);

// Use relative paths since we're passing REPO_ROOT to YAMLHandler
const INPUT_FILE = '_data/video_urls.yml';
const OUTPUT_FILE = '_data/youtube_videos.yml';

console.log('Input file:', INPUT_FILE);
console.log('Output file:', OUTPUT_FILE);

// Schema for validation
const VIDEO_URLS_SCHEMA = {
  media_appearances: {
    type: 'object'
  }
};

export async function updateYouTubeData(options = { verbose: false }) {
  console.log('updateYouTubeData called with options:', options);
  
  const logger = new Logger(options.verbose);
  const yaml = new YAMLHandler(REPO_ROOT);

  try {
    console.log('Checking for YouTube API key...');
    // Initialize YouTube API
    const apiKey = process.env.YOUTUBE_API_KEY;
    console.log('API Key present:', !!apiKey);
    
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable is not set');
    }

    const youtube = new YouTubeAPI(apiKey);
    console.log('YouTube API initialized');

    // Read and validate input YAML
    console.log('Reading YAML file from:', INPUT_FILE);
    const inputData = await yaml.readYAML(INPUT_FILE);
    console.log('YAML file read successfully');
    
    yaml.validateStructure(inputData, VIDEO_URLS_SCHEMA);
    console.log('YAML structure validated');

    // Process videos
    const enrichedData = {
      media_appearances: {}
    };

    for (const [category, urls] of Object.entries(inputData.media_appearances)) {
      logger.startSpinner(`Processing ${category}...`);
      logger.debug(`Category ${category} has ${urls.length} videos`);
      enrichedData.media_appearances[category] = [];

      for (const [index, url] of urls.entries()) {
        logger.updateSpinner(`Processing ${category} (${index + 1}/${urls.length})`);
        logger.debug(`Processing URL: ${url}`);
        const videoId = YouTubeAPI.getVideoId(url);
        
        if (!videoId) {
          logger.warn(`Invalid URL: ${url}`);
          continue;
        }

        try {
          const videoDetails = await youtube.getVideoDetails(videoId);
          if (videoDetails) {
            enrichedData.media_appearances[category].push(videoDetails);
            logger.debug(`Successfully processed video: ${videoDetails.title}`);
          }
        } catch (error) {
          logger.warn(`Failed to fetch video ${url}: ${error.message}`);
        }
      }

      logger.success(`Processed ${category}`);
    }

    // Write output YAML
    logger.startSpinner('Writing enriched data...');
    await yaml.writeYAML(OUTPUT_FILE, enrichedData);
    logger.success('Successfully generated enriched YAML file');

    return true;
  } catch (error) {
    console.error('Error in updateYouTubeData:', error);
    console.error('Stack trace:', error.stack);
    logger.error('Failed to update YouTube data', error);
    return false;
  }
} 