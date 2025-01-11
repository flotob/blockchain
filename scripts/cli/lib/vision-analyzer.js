import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function formatDate(dateStr) {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // If it's just a year, append -01-01
    if (/^\d{4}$/.test(dateStr)) {
        return `${dateStr}-01-01`;
    }
    
    // Try to extract year from string
    const yearMatch = dateStr.match(/\d{4}/);
    if (yearMatch) {
        return `${yearMatch[0]}-01-01`;
    }
    
    // Fallback to current year
    return `${new Date().getFullYear()}-01-01`;
}

async function getCacheKey(imagePath) {
  const buffer = await fs.readFile(imagePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

async function getFromCache(cacheKey) {
  try {
    const cacheFile = path.join('.cache', 'vision', `${cacheKey}.json`);
    const data = await fs.readFile(cacheFile, 'utf8');
    const cached = JSON.parse(data);
    // Could add timestamp check here if needed
    return cached.result;
  } catch {
    return null;
  }
}

async function saveToCache(cacheKey, result) {
  const cacheDir = path.join('.cache', 'vision');
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(
    path.join(cacheDir, `${cacheKey}.json`),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      result
    })
  );
}

function generateFallbackMetadata(imagePath, filename) {
    // Extract year from filename if it matches a pattern like YYYY or 20XX
    const yearMatch = filename.match(/20\d{2}/);
    const currentYear = new Date().getFullYear();
    const year = yearMatch ? yearMatch[0] : currentYear.toString();
    
    // Guess organization from path
    const pathParts = imagePath.split('/');
    const orgIndex = pathParts.indexOf('advocacy') + 1;
    const org = orgIndex < pathParts.length ? pathParts[orgIndex] : 'Unknown Organization';
    
    // Clean up filename to create title
    const title = filename
        .replace(/\.pdf$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/\d{4}/g, '') // Remove year numbers
        .replace(/\s+/g, ' ')
        .trim();
    
    // Guess document type from filename/title
    let type = 'document';
    if (title.toLowerCase().includes('proposal')) type = 'proposal';
    else if (title.toLowerCase().includes('paper')) type = 'position paper';
    else if (title.toLowerCase().includes('regulation')) type = 'regulation';
    
    // Guess language
    const language = filename.toLowerCase().includes('de') ? 'de' : 'en';
    
    // Generate basic tags from title
    const tags = title.toLowerCase()
        .split(' ')
        .filter(word => word.length > 3)
        .filter(word => !['the', 'and', 'for', 'with'].includes(word));
    
    return {
        title,
        date: formatDate(year),
        type,
        language,
        organization: org,
        tags: tags.slice(0, 5) // Limit to 5 most relevant words as tags
    };
}

export async function analyzeDocument(imagePath) {
    try {
        const filename = path.basename(imagePath);
        console.log(`Processing ${filename}...`);

        // Check cache first
        const cacheKey = `${path.basename(imagePath)}-gpt-4o`;
        const cached = await getFromCache(cacheKey);
        if (cached) {
            console.log(`[cache] Using cached result for ${filename}`);
            return cached;
        }

        // Read image as base64
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');

        const systemPrompt = `You are a document metadata extractor. Analyze the document cover page and return a JSON response with the following fields:
    - title: The full title of the document
    - date: The publication date in YYYY-MM-DD format if an exact date is visible. If only a year is visible or can be confidently inferred, return just the year (YYYY). You must at minimum return a year - never return null.
    - type: The document type (e.g. "position paper", "regulation", "proposal", etc.). If unclear, infer from content and style. Never return null.
    - language: The primary language of the document ("en" or "de")
    - organization: The publishing organization. If not explicitly shown, infer from document style, content, or context. Never return null.
    - tags: Array of relevant topic tags (e.g. ["blockchain", "regulation", "finance"])

    IMPORTANT:
    - For dates: Return full YYYY-MM-DD if visible on document, otherwise return YYYY if you can determine/estimate the year
    - NEVER return null values
    - Make educated guesses based on available information
    - If exact date unknown, estimate year from content/context
    - If type unclear, infer from document style/format
    - If organization not shown, deduce from letterhead/style/content
    - Better to make an educated guess than return null

    Return ONLY the JSON object, no other text.`;

        const requestPayload = {
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: systemPrompt 
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Please analyze this document cover page and extract metadata as json. Make educated guesses for any unclear fields - never return null values."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            response_format: { type: "json_object" }
        };

        console.log(`[api] Sending request to OpenAI for ${filename}`);
        const response = await openai.chat.completions.create(requestPayload);
        
        const result = response.choices[0].message.content;
        console.log(`[api] Received response for ${filename}`);
        
        // Parse and validate the response
        let metadata;
        try {
            metadata = JSON.parse(result);
            console.log(`[debug] Initial metadata for ${filename}:`, JSON.stringify(metadata, null, 2));
        } catch (error) {
            console.log(`[warn] Failed to parse OpenAI response, using fallback: ${error.message}`);
            metadata = generateFallbackMetadata(imagePath, filename);
        }
        
        // If metadata is null or undefined, use fallback
        if (!metadata) {
            console.log(`[warn] Received null metadata, using fallback`);
            metadata = generateFallbackMetadata(imagePath, filename);
        }

        // Ensure all required fields have values
        const fallback = generateFallbackMetadata(imagePath, filename);
        Object.entries(fallback).forEach(([key, value]) => {
            if (!metadata[key] || metadata[key] === null) {
                console.log(`[warn] Using fallback for ${key}`);
                metadata[key] = value;
            }
        });

        // Ensure tags is an array
        if (!Array.isArray(metadata.tags)) {
            metadata.tags = metadata.tags ? [metadata.tags] : fallback.tags;
        }

        // Update the metadata processing to format dates
        // After the metadata validation and before caching
        if (metadata.date) {
            metadata.date = formatDate(metadata.date);
        }

        // Cache successful result
        await saveToCache(cacheKey, metadata);
        console.log(`[success] Processed ${filename}`);
        return metadata;

    } catch (error) {
        console.error(`[error] Failed to process ${path.basename(imagePath)}: ${error.message}`);
        // Even on error, return fallback metadata instead of throwing
        const fallback = generateFallbackMetadata(imagePath, path.basename(imagePath));
        await saveToCache(cacheKey, fallback);
        return fallback;
    }
} 