import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { YouTubeAPI } from '../lib/youtube-api.js';
import { YAMLHandler } from '../lib/yaml.js';
import { Logger } from '../lib/logger.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

const INPUT_FILE = path.join(REPO_ROOT, '_data', 'video_urls.yml');
const OUTPUT_FILE = path.join(REPO_ROOT, '_data', 'youtube_videos.yml');

// Schema for validation
const VIDEO_URLS_SCHEMA = {
  media_appearances: {
    type: 'object'
  }
};

export async function updateYouTubeData(options = { verbose: false }) {
  const logger = new Logger(options.verbose);
  const yaml = new YAMLHandler(REPO_ROOT);

  try {
    // Initialize YouTube API
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable is not set');
    }
    const youtube = new YouTubeAPI(apiKey);

    // Read and validate input YAML
    logger.startSpinner('Reading video URLs...');
    const inputData = await yaml.readYAML(INPUT_FILE);
    yaml.validateStructure(inputData, VIDEO_URLS_SCHEMA);
    logger.success('Video URLs loaded successfully');

    // Process videos
    const enrichedData = {
      media_appearances: {}
    };

    for (const [category, urls] of Object.entries(inputData.media_appearances)) {
      logger.startSpinner(`Processing ${category}...`);
      enrichedData.media_appearances[category] = [];

      for (const [index, url] of urls.entries()) {
        logger.updateSpinner(`Processing ${category} (${index + 1}/${urls.length})`);
        const videoId = YouTubeAPI.getVideoId(url);
        
        if (!videoId) {
          logger.warn(`Invalid URL: ${url}`);
          continue;
        }

        try {
          const videoDetails = await youtube.getVideoDetails(videoId);
          if (videoDetails) {
            enrichedData.media_appearances[category].push(videoDetails);
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
    logger.error('Failed to update YouTube data', error);
    return false;
  }
} 