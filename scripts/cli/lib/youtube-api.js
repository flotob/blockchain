import { google } from 'googleapis';
import chalk from 'chalk';

export class YouTubeAPI {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('YouTube API key is required');
    }
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
  }

  // Extract video ID from various YouTube URL formats
  static getVideoId(url) {
    const patterns = [
      /[?&]v=([^&]+)/, // Standard YouTube URL
      /youtu\.be\/([^?]+)/, // Shortened URL
      /embed\/([^?]+)/, // Embed URL
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Fetch video details with retries
  async getVideoDetails(videoId, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const [videoResponse, channelResponse] = await Promise.all([
          this.youtube.videos.list({
            part: ['snippet', 'statistics', 'contentDetails'],
            id: videoId
          }),
          this.getChannelDetails(videoId)
        ]);

        const video = videoResponse.data.items[0];
        if (!video) {
          throw new Error(`No data found for video ID: ${videoId}`);
        }

        return {
          title: video.snippet.title,
          description: video.snippet.description,
          publishedAt: video.snippet.publishedAt,
          thumbnails: video.snippet.thumbnails,
          channel: {
            name: video.snippet.channelTitle,
            id: video.snippet.channelId,
            url: `https://www.youtube.com/channel/${video.snippet.channelId}`,
            thumbnail: channelResponse?.thumbnail
          },
          statistics: video.statistics,
          duration: video.contentDetails.duration,
          url: `https://www.youtube.com/watch?v=${videoId}`
        };
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed to fetch video ${videoId} after ${retries} attempts: ${error.message}`);
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Helper to fetch channel details
  async getChannelDetails(videoId) {
    try {
      const videoResponse = await this.youtube.videos.list({
        part: ['snippet'],
        id: videoId
      });

      const channelId = videoResponse.data.items[0]?.snippet?.channelId;
      if (!channelId) return null;

      const channelResponse = await this.youtube.channels.list({
        part: ['snippet'],
        id: channelId
      });

      const channelData = channelResponse.data.items[0]?.snippet;
      if (!channelData) return null;

      return {
        name: channelData.title,
        id: channelId,
        url: `https://www.youtube.com/channel/${channelId}`,
        thumbnail: {
          default: {
            url: channelData.thumbnails?.default?.url,
            width: channelData.thumbnails?.default?.width,
            height: channelData.thumbnails?.default?.height
          },
          medium: {
            url: channelData.thumbnails?.medium?.url,
            width: channelData.thumbnails?.medium?.width,
            height: channelData.thumbnails?.medium?.height
          }
        }
      };
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not fetch channel details for video ${videoId}`));
      return null;
    }
  }
} 