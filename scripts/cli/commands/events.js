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

const INPUT_FILE = path.join(REPO_ROOT, '_data', 'event_urls.yml');
const OUTPUT_FILE = path.join(REPO_ROOT, '_data', 'event_videos.yml');

// Schema for validation
const EVENT_URLS_SCHEMA = {
  events: {
    type: 'object',
    arrayOf: {
      title: { type: 'string' },
      description: { type: 'string', optional: true },
      years: {
        type: 'object',
        arrayOf: {
          year: { type: 'number' },
          videos: {
            type: 'object',
            arrayOf: {
              video: { type: 'string' }
            }
          }
        }
      }
    }
  }
};

export async function updateEventData(options = { verbose: false }) {
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
    logger.startSpinner('Reading event URLs...');
    const inputData = await yaml.readYAML(INPUT_FILE);
    yaml.validateStructure(inputData, EVENT_URLS_SCHEMA);
    logger.success('Event URLs loaded successfully');

    // Process events
    const enrichedData = {
      events: []
    };

    for (const [eventIndex, event] of inputData.events.entries()) {
      logger.startSpinner(`Processing event: ${event.title}...`);
      const enrichedEvent = {
        title: event.title,
        years: []
      };

      if (event.description) {
        enrichedEvent.description = event.description;
      }

      // Process each year's videos
      for (const yearData of event.years) {
        logger.debug(`Processing year ${yearData.year}`);
        const enrichedYear = {
          year: yearData.year,
          videos: []
        };

        // Process videos for this year
        for (const [videoIndex, videoData] of yearData.videos.entries()) {
          logger.updateSpinner(
            `Processing ${event.title} - ${yearData.year} (${videoIndex + 1}/${yearData.videos.length})`
          );

          const videoId = YouTubeAPI.getVideoId(videoData.video);
          if (!videoId) {
            logger.warn(`Invalid URL: ${videoData.video}`);
            continue;
          }

          try {
            const videoDetails = await youtube.getVideoDetails(videoId);
            if (videoDetails) {
              enrichedYear.videos.push(videoDetails);
            }
          } catch (error) {
            logger.warn(`Failed to fetch video ${videoData.video}: ${error.message}`);
          }
        }

        enrichedEvent.years.push(enrichedYear);
      }

      enrichedData.events.push(enrichedEvent);
      logger.success(`Processed event: ${event.title} (${eventIndex + 1}/${inputData.events.length})`);
    }

    // Write output YAML
    logger.startSpinner('Writing enriched event data...');
    await yaml.writeYAML(OUTPUT_FILE, enrichedData);
    logger.success('Successfully generated enriched events YAML file');

    return true;
  } catch (error) {
    logger.error('Failed to update event data:', error);
    if (error.stack) {
      logger.debug('Stack trace:', error.stack);
    }
    if (error.errors) {
      logger.debug('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    return false;
  }
} 