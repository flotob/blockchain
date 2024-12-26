import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const urls = [
    // Medium articles
    'https://heckerhut.medium.com/daos-are-dead-long-live-daos-50de94e8ee1e',
    'https://heckerhut.medium.com/can-the-wikipedia-model-be-applied-to-public-policy-making-ff4444a2ff60',
    'https://heckerhut.medium.com/the-berlin-legal-tech-2017-hackathon-retrospective-and-future-roadmaps-88f50d45aac8',
    'https://heckerhut.medium.com/a-blockchain-token-taxonomy-fadf5c56139a',
    'https://heckerhut.medium.com/how-we-use-smart-contracts-at-satoshipay-to-change-the-internet-s-economy-forever-today-777988a868d',
    'https://heckerhut.medium.com/smart-contracts-platforms-and-intermediaries-c3d30f5182a6',
    'https://heckerhut.medium.com/the-political-economy-of-computing-7fffc75423a2',
    'https://heckerhut.medium.com/modes-of-contractual-governance-in-an-on-demand-service-economy-1833629f379b',
    'https://heckerhut.medium.com/whats-a-smart-contract-in-search-of-a-consensus-c268c830a8ad',
    
    // Network Society articles
    'https://app.cg/c/networksociety/article/what-is-a-digital-jurisdiction-9KS8MHd9TPrGmXeeBkYW9t/',
    'https://app.cg/c/networksociety/article/should-daos-have-constitutions-8QDmXW61MQitjWYLuTiGgN/',
    'https://app.cg/c/networksociety/article/ongoing-research-on-sovereignty-in-the-digital-age-gdYwt5Uhm5Ty6uGWj9ANL7/',
    'https://app.cg/c/networksociety/article/decentralized-justice-state-of-the-art-recurring-criticisms-and-next-generation-research-topics-rM9Hj55BEBhGevLMVVTrbG/',
    'https://app.cg/c/networksociety/article/overthrowing-the-network-state-the-rise-of-coordinations-w7vg8EE92xsHbz6fWYHD4y/',
    'https://app.cg/c/networksociety/article/with-ai-regulation-on-the-horizon-compute-clusters-move-to-international-waters-rs3cySS29fLqY3AsSEthSD/',
    'https://app.cg/c/networksociety/article/our-favorite-talks-from-the-network-state-conference-dDEJRm68j1EcTRYivPbK7e/',
    'https://app.cg/c/networksociety/article/how-to-build-a-community-hivemind-notes-from-my-talk-at-the-daoists-global-governance-gathering-oic29gz4bTttyN95TdL9v6/',
    'https://app.cg/c/networksociety/article/enshrining-a-dispute-resolution-oracle-in-an-l2-blockchain-pTjp1ycs4gNtQYkjsxpPp5/',
    'https://app.cg/c/networksociety/article/institutional-decline-and-the-quiet-revolution-riuTgMXambTqAt9rthfmji/',
    'https://app.cg/c/networksociety/article/open-problems-in-daos-dMuTR4tMNnAGtssZS5NCPw/',
    'https://app.cg/c/networksociety/article/how-web3s-new-consumer-tech-stack-addresses-cryptos-great-filters-dxXwsvpadnGfzDTVCvAyrp/',
    'https://app.cg/c/networksociety/article/could-ecosystems-form-the-first-network-states-oisu2aouBrREn19a641SPe/',
    'https://app.cg/c/networksociety/article/the-prediction-agent-economy-mNHjTHmLgPLSuKNveLMnXi/',
    'https://app.cg/c/networksociety/article/future-state-exploring-emerging-democratic-practices-on-public-blockchains-6vrCWcYvYw6ihKinLGSziV/',
    'https://app.cg/c/networksociety/article/what-is-hypercomputing-9DS6v1bYAVQcv1kqrzUZjk/',
    'https://app.cg/c/networksociety/article/greetings-from-edge-city-lanna-bUjpySVf5HPEXJVYFS5gKG/'
];

const CACHE_FILE = 'images/blog/cache.json';
const MIN_IMAGE_SIZE = 5000; // 5KB minimum for a valid image
const MAX_RETRIES = 3;

// Load existing cache
async function loadCache() {
    try {
        const cache = await fs.readFile(CACHE_FILE, 'utf-8');
        return JSON.parse(cache);
    } catch {
        return {};
    }
}

// Save cache
async function saveCache(cache) {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// Validate image by checking its size and dimensions
async function isValidImage(filePath) {
    try {
        const stats = await fs.stat(filePath);
        if (stats.size < MIN_IMAGE_SIZE) {
            console.log(`Invalid image: ${filePath} (size: ${stats.size} bytes)`);
            await fs.unlink(filePath);
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

// Create URL-safe filename from article URL
function getImageFilename(url) {
    const urlParts = url.split('/');
    let slug;
    
    if (url.includes('medium.com')) {
        // For Medium articles, use the last part of the URL
        slug = urlParts[urlParts.length - 1];
    } else {
        // For Network Society articles, use the ID
        slug = urlParts[urlParts.length - 2];
    }
    
    return `blog-${slug}.jpg`;
}

async function downloadImage(imageUrl, filename) {
    try {
        const filePath = path.join('images', 'blog', filename);
        
        // Use headers that mimic a social media crawler
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const buffer = await response.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));
        
        // Validate the downloaded image
        if (await isValidImage(filePath)) {
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error downloading image ${imageUrl}:`, error);
        return false;
    }
}

async function getMediumImage(url, page, retryCount = 0) {
    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Wait for the main image to load
        await page.waitForSelector('img[role="presentation"]', { timeout: 5000 });
        
        // Get all image URLs from the page
        const imageUrls = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img[role="presentation"]'));
            return images
                .map(img => img.src)
                .filter(src => src.includes('miro.medium.com'))
                // Ensure we get the highest quality version
                .map(src => src.replace(/max\/\d+/, 'max/1200'));
        });
        
        if (!imageUrls.length) {
            throw new Error('No images found');
        }
        
        // Try each image URL until we find one that works
        for (const imageUrl of imageUrls) {
            const filename = getImageFilename(url);
            const downloaded = await downloadImage(imageUrl, filename);
            if (downloaded) {
                return {
                    url,
                    image: `images/blog/${filename}`
                };
            }
        }
        
        // If we get here, no images worked
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying ${url} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return getMediumImage(url, page, retryCount + 1);
        }
        
        return { url, image: null };
    } catch (error) {
        console.error(`Error processing Medium image for ${url}:`, error);
        
        // Retry on error
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying ${url} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return getMediumImage(url, page, retryCount + 1);
        }
        
        return { url, image: null };
    }
}

async function getNetworkSocietyImage(url, retryCount = 0) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'facebookexternalhit/1.1',
                'Accept': 'text/html,application/xhtml+xml',
            },
            redirect: 'follow'
        });
        
        const html = await response.text();
        
        // Try to extract og:image
        const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/);
        const twitterMatch = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/);
        
        const imageUrl = ogMatch?.[1] || twitterMatch?.[1];
        
        if (!imageUrl) {
            throw new Error('No meta image found');
        }
        
        const filename = getImageFilename(url);
        const downloaded = await downloadImage(imageUrl, filename);
        
        if (downloaded) {
            return {
                url,
                image: `images/blog/${filename}`
            };
        }
        
        // Retry if download failed
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying ${url} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return getNetworkSocietyImage(url, retryCount + 1);
        }
        
        return { url, image: null };
    } catch (error) {
        console.error(`Error processing Network Society image for ${url}:`, error);
        
        // Retry on error
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying ${url} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return getNetworkSocietyImage(url, retryCount + 1);
        }
        
        return { url, image: null };
    }
}

async function getAllImages() {
    // Ensure images/blog directory exists
    await fs.mkdir('images/blog', { recursive: true });
    
    // Load cache
    const cache = await loadCache();
    
    // Filter out URLs that we already have valid images for
    const urlsToProcess = [];
    for (const url of urls) {
        if (cache[url]) {
            try {
                if (await isValidImage(cache[url])) {
                    console.log(`Skipping ${url} (cached)`);
                    continue;
                }
            } catch {}
        }
        urlsToProcess.push(url);
    }
    
    if (!urlsToProcess.length) {
        console.log('All images are already cached and valid!');
        return;
    }
    
    console.log(`Processing ${urlsToProcess.length} URLs...`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport to ensure we get good quality images
    await page.setViewport({ width: 1200, height: 800 });
    
    // Set user agent to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');
    
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    // Process URLs in batches of 3 with delay
    for (let i = 0; i < urlsToProcess.length; i += 3) {
        const batch = urlsToProcess.slice(i, i + 3);
        for (const url of batch) {
            console.log(`\nFetching image for ${url}...`);
            
            const result = url.includes('medium.com')
                ? await getMediumImage(url, page)
                : await getNetworkSocietyImage(url);
            
            if (result.image) {
                cache[url] = result.image;
                successCount++;
            } else {
                failureCount++;
            }
            
            results.push(result);
        }
        
        if (i + 3 < urlsToProcess.length) {
            // Longer delay to be more polite
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    await browser.close();
    
    // Save updated cache
    await saveCache(cache);
    
    // Output results
    console.log('\nSummary:');
    console.log(`Processed: ${urlsToProcess.length}`);
    console.log(`Succeeded: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
    console.log('\nDetailed Results:');
    results.forEach(({url, image}) => {
        console.log(`URL: ${url}`);
        console.log(`Image: ${image || 'No image found'}`);
        console.log('---');
    });
}

getAllImages().catch(console.error); 