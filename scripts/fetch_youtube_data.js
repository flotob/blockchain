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

async function processVideos() {
  try {
    // Read input YAML
    const inputFile = path.join(__dirname, '..', '_data', 'video_urls.yml');
    const outputFile = path.join(__dirname, '..', '_data', 'youtube_videos.yml');
    const inputYaml = yaml.load(fs.readFileSync(inputFile, 'utf8'));

    const enrichedData = {
      media_appearances: {}
    };

    // Process each category
    for (const [category, urls] of Object.entries(inputYaml.media_appearances)) {
      console.log(`Processing ${category}...`);
      enrichedData.media_appearances[category] = [];

      for (const url of urls) {
        const videoId = getVideoId(url);
        if (!videoId) {
          console.error(`Invalid URL: ${url}`);
          continue;
        }

        const videoDetails = await getVideoDetails(videoId);
        if (videoDetails) {
          enrichedData.media_appearances[category].push(videoDetails);
        }
      }
    }

    // Write enriched YAML
    fs.writeFileSync(outputFile, yaml.dump(enrichedData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    }));

    console.log('Successfully generated enriched YAML file!');
  } catch (error) {
    console.error('Error processing videos:', error);
  }
}

// Create package.json if it doesn't exist
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  const packageJson = {
    "name": "youtube-data-fetcher",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "fetch-youtube": "node scripts/fetch_youtube_data.js"
    },
    "dependencies": {
      "dotenv": "^16.3.1",
      "googleapis": "^126.0.1",
      "js-yaml": "^4.1.0"
    }
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

processVideos(); 