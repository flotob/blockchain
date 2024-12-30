const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Read the markdown file
const mdFilePath = path.join(__dirname, '..', 'youtube', 'All youtube videos with me in it.md');
console.log('Reading file:', mdFilePath);
const mdContent = fs.readFileSync(mdFilePath, 'utf8');
console.log('File content length:', mdContent.length);

// Initialize the output structure
const output = {
  media_appearances: {
    interviews: [],
    podcasts: [],
    lectures: [],
    press_conferences: []
  }
};

// Helper function to clean the URL
function cleanUrl(url) {
  // Remove any trailing whitespace or &
  return url.trim().replace(/&$/, '');
}

// Parse the markdown content
let currentCategory = null;
let currentYear = null;

mdContent.split('\n').forEach((line, index) => {
  const originalLine = line;
  line = line.trim();
  
  // Skip empty lines and the header
  if (!line || line.startsWith('#website')) return;

  // Check for main categories
  if (line === '- lectures') {
    currentCategory = 'lectures';
    console.log('Found category:', currentCategory);
  }
  else if (line === '- interviews') {
    currentCategory = 'interviews';
    console.log('Found category:', currentCategory);
  }
  else if (line === '- podcasts') {
    currentCategory = 'podcasts';
    console.log('Found category:', currentCategory);
  }
  else if (line === '- press conferences') {
    currentCategory = 'press_conferences';
    console.log('Found category:', currentCategory);
  }
  // Check for year
  else if (line.match(/^\t*- \d{4}$/)) {
    currentYear = line.trim().replace('- ', '');
    console.log('Found year:', currentYear);
  }
  // Check for URL
  else if (line.includes('https://www.youtube.com/watch?v=')) {
    if (currentCategory) {
      const url = line.match(/(https:\/\/www\.youtube\.com\/watch\?v=[^\s&]+)/)[1];
      output.media_appearances[currentCategory].push(cleanUrl(url));
      console.log('Added URL for', currentCategory, ':', url);
    } else {
      console.log('Found URL but no category:', line);
    }
  }
});

// Write the output YAML file
const outputPath = path.join(__dirname, '..', '_data', 'video_urls.yml');
fs.writeFileSync(outputPath, yaml.dump(output, {
  indent: 2,
  lineWidth: -1,
  noRefs: true
}));

console.log('\nFinal output:');
console.log(yaml.dump(output)); 