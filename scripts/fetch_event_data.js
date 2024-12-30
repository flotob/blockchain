require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Helper function to extract video ID from URL
function getVideoId(url) {
  const regex = /[?&]v=([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Fetch video details from YouTube API
async function getVideoDetails(videoId) {
  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoId
    });

    if (response.data.items.length === 0) {
      console.error(`No data found for video ID: ${videoId}`);
      return null;
    }

    const video = response.data.items[0];
    const channelResponse = await youtube.channels.list({
      part: ['snippet'],
      id: video.snippet.channelId
    });

    return {
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      channel: {
        name: video.snippet.channelTitle,
        id: video.snippet.channelId,
        url: `https://www.youtube.com/channel/${video.snippet.channelId}`,
        thumbnail: channelResponse.data.items[0].snippet.thumbnails,
      },
      statistics: video.statistics,
      duration: video.contentDetails.duration,
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  } catch (error) {
    console.error(`Error fetching data for video ${videoId}:`, error.message);
    return null;
  }
}

async function processEvents() {
  try {
    // Read input YAML
    const inputFile = path.join(__dirname, '..', '_data', 'event_urls.yml');
    const outputFile = path.join(__dirname, '..', '_data', 'event_videos.yml');
    const inputYaml = yaml.load(fs.readFileSync(inputFile, 'utf8'));

    const enrichedData = {
      events: []
    };

    // Process each event
    for (const event of inputYaml.events) {
      console.log(`Processing event: ${event.title}...`);
      const enrichedEvent = {
        title: event.title,
        description: event.description,
        years: []
      };

      // Process each year's videos
      for (const yearData of event.years) {
        const enrichedYear = {
          year: yearData.year,
          videos: []
        };

        // Process each video in the year
        for (const videoData of yearData.videos) {
          const videoId = getVideoId(videoData.video);
          if (!videoId) {
            console.error(`Invalid URL: ${videoData.video}`);
            continue;
          }

          const videoDetails = await getVideoDetails(videoId);
          if (videoDetails) {
            enrichedYear.videos.push(videoDetails);
          }
        }

        enrichedEvent.years.push(enrichedYear);
      }

      enrichedData.events.push(enrichedEvent);
    }

    // Write enriched YAML
    fs.writeFileSync(outputFile, yaml.dump(enrichedData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    }));

    console.log('Successfully generated enriched events YAML file!');
  } catch (error) {
    console.error('Error processing events:', error);
  }
}

// Check if package.json exists and has required dependencies
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  const packageJson = {
    "name": "youtube-data-fetcher",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "fetch-youtube": "node scripts/fetch_youtube_data.js",
      "fetch-events": "node scripts/fetch_event_data.js"
    },
    "dependencies": {
      "dotenv": "^16.3.1",
      "googleapis": "^126.0.1",
      "js-yaml": "^4.1.0"
    }
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
} else {
  // Update existing package.json with new script
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!packageJson.scripts['fetch-events']) {
    packageJson.scripts['fetch-events'] = 'node scripts/fetch_event_data.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

processEvents(); 