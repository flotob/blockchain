const fs = require('fs');
const yaml = require('js-yaml');

function extractVideoInfo(content) {
    const videos = {
        media_appearances: {
            podcasts: new Map(),
            lectures: new Map(),
            interviews: new Map(),
            press_conferences: new Map()
        }
    };

    let currentCategory = null;
    let currentYear = null;
    const lines = content.split('\n');
    console.log('Starting to parse content...');
    console.log(`Found ${lines.length} lines to process\n`);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and the header
        if (!line || line.startsWith('#website')) continue;
        
        // Category detection (top level items)
        if (line.match(/^- (podcasts|lectures|interviews|press conferences)$/)) {
            currentCategory = line.replace('- ', '').trim().replace(' ', '_');
            console.log(`\nFound category: ${currentCategory}`);
            continue;
        }

        // Year detection (second level items)
        if (line.match(/^- \d{4}$/)) {
            currentYear = line.replace('- ', '').trim();
            console.log(`Found year: ${currentYear}`);
            if (!videos.media_appearances[currentCategory].has(currentYear)) {
                videos.media_appearances[currentCategory].set(currentYear, []);
            }
            continue;
        }

        // Video URL detection
        if (line.includes('youtube.com')) {
            const urlMatch = line.match(/https:\/\/www\.youtube\.com\/watch\?v=[^\s&]+/);
            if (urlMatch) {
                const url = urlMatch[0];
                console.log(`Found video URL: ${url}`);

                // Look ahead for title and channel
                let title = null;
                let channel = null;
                
                // Search next lines for title and channel
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const nextLine = lines[j]?.trim();
                    if (!nextLine) continue;
                    
                    if (nextLine.includes('- title:')) {
                        title = nextLine.replace('- title:', '').replace('#', '').trim();
                        console.log(`Found title: ${title}`);
                    } else if (nextLine.includes('- channel:') || nextLine.includes('- Channel:')) {
                        channel = nextLine.replace(/- [Cc]hannel:/, '').trim();
                        console.log(`Found channel: ${channel}`);
                    }
                }

                if (title) {
                    const video = {
                        url,
                        title,
                        ...(channel && { channel })
                    };

                    if (title.toLowerCase().includes('press conference') && currentCategory !== 'press_conferences') {
                        console.log(`Detected press conference: ${title}`);
                        if (!videos.media_appearances.press_conferences.has(currentYear)) {
                            videos.media_appearances.press_conferences.set(currentYear, []);
                        }
                        videos.media_appearances.press_conferences.get(currentYear).push(video);
                    } else {
                        videos.media_appearances[currentCategory].get(currentYear).push(video);
                    }
                    console.log(`Added video to ${currentCategory}/${currentYear}: ${title}\n`);
                }
            }
        }
    }

    console.log('\nParsing complete. Summary before sorting:\n');
    for (const category in videos.media_appearances) {
        console.log(`${category}:`);
        const years = Array.from(videos.media_appearances[category].keys());
        console.log(`  Years order: ${years.join(', ')}`);
        for (const [year, yearVideos] of videos.media_appearances[category]) {
            console.log(`  ${year}: ${yearVideos.length} videos`);
        }
        console.log('');
    }

    // Sort videos by year in descending order and convert to array structure
    const sortedVideos = {
        media_appearances: {}
    };

    console.log('\nSorting years in descending order...\n');
    for (const category in videos.media_appearances) {
        const years = Array.from(videos.media_appearances[category].keys()).sort((a, b) => b - a);
        console.log(`${category}:`);
        console.log(`  Sorted years: ${years.join(', ')}`);
        
        // Create array of year objects
        sortedVideos.media_appearances[category] = years.map(year => ({
            year: parseInt(year),
            videos: videos.media_appearances[category].get(year)
        }));
        console.log('');
    }

    return sortedVideos;
}

try {
    console.log('Starting conversion process...');
    console.log('Attempting to read markdown file...');
    const content = fs.readFileSync('youtube/All youtube videos with me in it.md', 'utf8');
    console.log('Successfully read markdown file');
    
    console.log('Extracting video information...');
    const videos = extractVideoInfo(content);
    
    console.log('Converting to YAML format...');
    const yamlContent = yaml.dump(videos, { 
        quotingType: '"',
        noRefs: true,
        sortKeys: false
    });
    
    console.log('Writing YAML to _data/youtube_videos.yml...');
    fs.writeFileSync('_data/youtube_videos.yml', yamlContent);
    
    // Verify the final order in the YAML file
    console.log('\nVerifying year order in generated YAML:');
    const generatedYaml = yaml.load(yamlContent);
    for (const category in generatedYaml.media_appearances) {
        const years = generatedYaml.media_appearances[category].map(y => y.year);
        console.log(`${category}:`);
        console.log(`  Final year order: ${years.join(', ')}`);
    }
    
    console.log('\nSuccessfully converted markdown to YAML!');
    console.log('Conversion process complete.');
} catch (error) {
    console.error('Error:', error.message);
    console.error('Current working directory:', process.cwd());
} 