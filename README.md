# blockchain.lawyer

Personal website built with Jekyll, featuring a YouTube video integration for media appearances.

## Setup

1. Install dependencies:
```bash
bundle install
```

2. Create a `.env` file in the root directory with your YouTube API key:
```bash
YOUTUBE_API_KEY=your_api_key_here
```

## Commands

### Development Server

Run the Jekyll development server with live reload:
```bash
bundle exec jekyll serve --livereload
```

### YouTube Video Integration

The site uses a two-step process to display YouTube videos:

1. Maintain a simple list of video URLs in `_data/video_urls.yml`, organized by category:
   - interviews
   - podcasts
   - lectures
   - press_conferences

2. Generate enriched video data using the YouTube API:
```bash
node scripts/fetch_youtube_data.js
```
This script:
- Reads video URLs from `_data/video_urls.yml`
- Fetches metadata from YouTube (titles, thumbnails, view counts, etc.)
- Generates `_data/youtube_videos.yml` with enriched data

## File Structure

- `_data/video_urls.yml` - Source file with YouTube video URLs
- `_data/youtube_videos.yml` - Generated file with enriched video data
- `_layouts/minimal.html` - Minimal layout template
- `index.html` - Main page with video grid
- `scripts/fetch_youtube_data.js` - YouTube data fetching script

## Development Notes

- The `.env` file is ignored by Git to keep the API key secure
- Videos are displayed in reverse chronological order (newest first)
- Each video category uses a horizontal scrolling grid
- Video cards show:
  - High-quality thumbnail
  - Video duration
  - Title
  - Channel info with logo
  - View count
  - Publication date
