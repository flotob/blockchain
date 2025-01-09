import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

export async function analyzeDocument(imagePath) {
  try {
    const filename = path.basename(imagePath);
    console.log(`Processing ${filename}...`);

    // Check cache first
    const cacheKey = await getCacheKey(imagePath);
    const cached = await getFromCache(cacheKey);
    if (cached) {
      console.log(`[cache] Using cached result for ${filename}`);
      return cached;
    }

    // Read image as base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const systemPrompt = `You are a document metadata extractor. Please analyze the document cover page and return a JSON response with the following fields:
    - title: The full title of the document
    - date: The publication date in YYYY format, or null if not found
    - type: The document type (e.g. "position paper", "regulation", "proposal", etc.)
    - language: The primary language of the document ("en" or "de")
    - organization: The publishing organization
    - tags: Array of relevant topic tags (e.g. ["blockchain", "regulation", "finance"])

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
              text: "Please analyze this document cover page and extract metadata as json. Return the response as a json object with the specified fields."
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
      throw new Error(`Failed to parse OpenAI response as JSON: ${result}`);
    }
    
    // Check for null fields and retry with full PDF if needed
    const nullFields = Object.entries(metadata)
      .filter(([key, value]) => value === null)
      .map(([key]) => key);
      
    if (nullFields.length > 0) {
      console.log(`[retry] Found null fields in ${filename}: ${nullFields.join(', ')}`);
      
      // Get the original PDF path
      const pdfPath = imagePath.replace('.1.jpg', '');
      if (await fs.access(pdfPath).then(() => true).catch(() => false)) {
        const pdfBuffer = await fs.readFile(pdfPath);
        const base64Pdf = pdfBuffer.toString('base64');
        
        // Add debug logging
        console.log(`[debug] Attempting retry with full PDF for ${filename}`);
        
        const retryPayload = {
          ...requestPayload,
          messages: [
            { 
              role: "system", 
              content: `You are a document metadata extractor. You have access to the full PDF document. Please analyze it thoroughly and return a JSON response with the following fields:
    - title: The full title of the document
    - date: The publication date in YYYY format. If not found in the document:
        1. Look for contextual clues (references to events, regulations, or other dated documents)
        2. Check if the document discusses specific events or regulations that can help date it
        3. Make an educated guess based on the document's content and context
        4. If you make a guess, use the first day of the estimated month (e.g., "2021-01-01" for "early 2021")
    - type: The document type (e.g. "position paper", "regulation", "proposal", etc.)
    - language: The primary language of the document ("en" or "de")
    - organization: The publishing organization
    - tags: Array of relevant topic tags (e.g. ["blockchain", "regulation", "finance"])

Look through the entire document to find this information, especially dates and document types which may be mentioned in headers, footers, or metadata sections.

For dates specifically:
- Check document properties and metadata
- Look for date patterns in headers, footers, and version numbers
- Consider references to specific events or regulations that can help date the document
- Use contextual clues to make an educated guess if no explicit date is found

Return ONLY the JSON object, no other text.` 
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please analyze this full document and extract metadata as json. Pay special attention to any null fields from the previous analysis, particularly the date field."
                },
                {
                  type: "file_url",
                  file_url: {
                    url: `data:application/pdf;base64,${base64Pdf}`
                  }
                }
              ]
            }
          ]
        };

        console.log(`[api] Sending retry request to OpenAI for ${filename}`);
        const retryResponse = await openai.chat.completions.create(retryPayload);
        const retryResult = retryResponse.choices[0].message.content;
        console.log(`[debug] Retry response received for ${filename}`);
        
        try {
          const retryMetadata = JSON.parse(retryResult);
          console.log(`[debug] Original metadata: ${JSON.stringify(metadata)}`);
          console.log(`[debug] Retry metadata: ${JSON.stringify(retryMetadata)}`);
          
          // Merge the retry results, keeping non-null values from either response
          metadata = {
            ...metadata,
            ...Object.fromEntries(
              Object.entries(retryMetadata)
                .filter(([key, value]) => value !== null || metadata[key] === null)
            )
          };
          
          console.log(`[debug] Merged metadata: ${JSON.stringify(metadata)}`);
        } catch (error) {
          console.log(`[warn] Failed to parse retry response: ${error.message}`);
        }
      }
    }
    
    // Validate required fields - only check for existence, not null values
    const requiredFields = ['title', 'date', 'type', 'language', 'organization', 'tags'];
    const missingFields = requiredFields.filter(field => !(field in metadata));
    
    if (missingFields.length > 0) {
      const error = new Error(`Invalid response: missing fields ${missingFields.join(', ')}`);
      // Cache the error to avoid re-processing
      await saveToCache(cacheKey, { error: error.message });
      throw error;
    }

    // Ensure tags is an array
    if (!Array.isArray(metadata.tags)) {
      metadata.tags = [metadata.tags].filter(Boolean);
    }

    // Cache successful result
    await saveToCache(cacheKey, metadata);
    console.log(`[success] Processed ${filename}`);
    return metadata;

  } catch (error) {
    // Cache errors to avoid re-processing problematic files
    const cacheKey = await getCacheKey(imagePath);
    await saveToCache(cacheKey, { error: error.message });
    console.error(`[error] Failed to process ${path.basename(imagePath)}: ${error.message}`);
    throw error;
  }
} 