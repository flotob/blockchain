import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { YAMLHandler } from '../lib/yaml.js';
import { Logger } from '../lib/logger.js';
import { fromPath } from 'pdf2pic';
import { analyzeDocument } from '../lib/vision-analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

// Relative paths from repo root
const IMPORT_DIR = 'import/advocacy';
const ASSETS_DIR = 'assets/pdf';
const PREVIEW_DIR = 'assets/images/advocacy';
const DATA_FILE = '_data/advocacy.yml';
const COLLECTION_DIR = '_advocacy';

async function generatePreview(pdfPath, outputName) {
  try {
    // Ensure preview directory exists
    const previewDir = path.join(REPO_ROOT, PREVIEW_DIR);
    await fs.mkdir(previewDir, { recursive: true });

    console.log(`Generating preview for ${pdfPath}`);

    // Convert first page to JPG using pdf2pic
    const options = {
      density: 150,
      saveFilename: outputName,
      savePath: previewDir,
      format: "jpg",
      width: 800,
      height: 1067 // Maintains roughly A4 proportions
    };
    
    const convert = fromPath(pdfPath, options);
    await convert(1); // Convert first page only
    console.log('PDF to JPG conversion successful');

    // Return relative path for storage - include the .1 suffix that pdf2pic adds
    return path.join('/', PREVIEW_DIR, `${outputName}.1.jpg`);
  } catch (error) {
    console.error(`Failed to generate preview for ${pdfPath}:`, error);
    return null;
  }
}

async function createCollectionFile(org, document) {
  // Ensure document has all required fields
  const requiredFields = ['title', 'date', 'type', 'language', 'pdf_url', 'tags'];
  const missingFields = requiredFields.filter(field => !(field in document));
  
  if (!document || missingFields.length > 0) {
    console.error('Document is missing required fields:', document);
    throw new Error(`Document is missing required fields: ${missingFields.join(', ')}`);
  }

  const slug = document.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filePath = path.join(REPO_ROOT, COLLECTION_DIR, `${org}-${slug}.md`);
  
  const frontMatter = [
    '---',
    `title: "${document.title}"`,
    `date: ${document.date || 'null'}`,
    `organization: ${org}`,
    `type: ${document.type}`,
    `language: ${document.language}`,
    `pdf_url: "${document.pdf_url}"`,
    `preview_image: "${document.preview_image}"`,
    `file_size: ${document.file_size}`,
    `tags: [${document.tags.map(t => `"${t}"`).join(', ')}]`,
    '---',
    '',
    `# ${document.title}`,
    '',
    `**Organization:** ${org}`,
    `**Type:** ${document.type}`,
    `**Language:** ${document.language}`,
    `**Date:** ${document.date || 'Not specified'}`,
    '',
    `## Document Details`,
    '',
    `- File Size: ${document.file_size}KB`,
    '',
    `## Download`,
    '',
    `[Download PDF](${document.pdf_url})`,
    '',
    `## Tags`,
    '',
    document.tags.map(tag => `- ${tag}`).join('\n')
  ].join('\n');
  
  await fs.writeFile(filePath, frontMatter, 'utf8');
}

async function processDocument(filePath, org) {
  try {
    const stats = await fs.stat(filePath);
    const fileSize = Math.round(stats.size / 1024); // Convert to KB
    const filename = path.basename(filePath, '.pdf');

    // Generate preview image
    const previewPath = await generatePreview(filePath, `${org}-${filename}`);
    if (!previewPath) {
      throw new Error('Failed to generate preview image');
    }

    // Get metadata from OpenAI vision analysis
    const metadata = await analyzeDocument(path.join(REPO_ROOT, previewPath));

    // Copy PDF to assets directory
    const assetsPath = path.join(REPO_ROOT, ASSETS_DIR, org);
    await fs.mkdir(assetsPath, { recursive: true });
    await fs.copyFile(filePath, path.join(assetsPath, path.basename(filePath)));

    // Create document object
    const document = {
      ...metadata,
      pdf_url: path.join('/', ASSETS_DIR, org, path.basename(filePath)),
      preview_image: previewPath,
      file_size: fileSize
    };

    // Create collection file
    await createCollectionFile(org, document);

    return document;
  } catch (error) {
    console.error(`Failed to process ${filePath}:`, error);
    return null;
  }
}

export async function importAdvocacyDocuments(options = { verbose: false }) {
  const logger = new Logger(options.verbose);
  const yaml = new YAMLHandler(REPO_ROOT);

  try {
    logger.startSpinner('Starting advocacy documents import...');
    
    // Create collection directory if it doesn't exist
    await fs.mkdir(path.join(REPO_ROOT, COLLECTION_DIR), { recursive: true });
    
    // Read existing data or initialize with empty structure
    let advocacyData;
    try {
      advocacyData = await yaml.readYAML(DATA_FILE);
    } catch (error) {
      logger.debug('No existing advocacy data, starting fresh');
      advocacyData = {};
    }
    
    // Process each organization
    const orgs = await fs.readdir(path.join(REPO_ROOT, IMPORT_DIR));
    
    for (const org of orgs) {
      if (org.startsWith('.')) continue; // Skip hidden files/folders
      
      logger.updateSpinner(`Processing ${org}...`);
      const orgPath = path.join(REPO_ROOT, IMPORT_DIR, org);
      const stat = await fs.stat(orgPath);
      
      if (!stat.isDirectory()) continue;
      
      // Initialize org in data if not exists
      advocacyData[org] = advocacyData[org] || {};
      advocacyData[org].documents = advocacyData[org].documents || [];
      
      // Read all PDFs in org directory
      const files = await fs.readdir(orgPath);
      const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
      
      for (const file of pdfFiles) {
        logger.updateSpinner(`Processing ${file}...`);
        logger.debug(`Starting to process ${file}`);
        
        const sourcePath = path.join(orgPath, file);
        
        try {
          // Generate preview image
          logger.debug(`Generating preview image for ${file}`);
          const previewPath = await generatePreview(sourcePath, `${org}-${file}`);
          if (!previewPath) {
            logger.warn(`Failed to generate preview for ${file}`);
            continue;
          }

          // Get metadata from OpenAI vision analysis
          logger.debug(`Analyzing document with OpenAI Vision: ${file}`);
          const metadata = await analyzeDocument(path.join(REPO_ROOT, previewPath));
          
          // Copy PDF to assets directory
          logger.debug(`Copying PDF to assets directory: ${file}`);
          const targetDir = path.join(REPO_ROOT, ASSETS_DIR, org);
          await fs.mkdir(targetDir, { recursive: true });
          const targetPath = path.join(ASSETS_DIR, org, file);
          await fs.copyFile(sourcePath, path.join(REPO_ROOT, targetPath));
          
          // Create document entry
          const document = {
            ...metadata,
            pdf_url: `/${targetPath}`,
            preview_image: previewPath,
            file_size: Math.round((await fs.stat(sourcePath)).size / 1024) // Size in KB
          };
          
          // Check if document already exists (by pdf_url)
          const existingIndex = advocacyData[org].documents.findIndex(
            d => d.pdf_url === document.pdf_url
          );
          
          if (existingIndex >= 0) {
            advocacyData[org].documents[existingIndex] = document;
            logger.debug(`Updated existing document: ${file}`);
          } else {
            advocacyData[org].documents.push(document);
            logger.debug(`Added new document: ${file}`);
          }
          
          // Create collection file
          logger.debug(`Creating collection file for ${file}`);
          await createCollectionFile(org, document);
          
          logger.debug(`Successfully processed ${file}`);
        } catch (error) {
          logger.error(`Failed to process ${file}:`, error);
          console.error('Detailed error:', error);
          continue;
        }
      }
      
      // Sort documents by date (newest first)
      if (advocacyData[org].documents.length > 0) {
        advocacyData[org].documents.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
    }
    
    // Save updated data
    await yaml.writeYAML(DATA_FILE, advocacyData);
    logger.stopSpinner();
    logger.success('Advocacy documents import completed successfully');
    
    return true;
  } catch (error) {
    logger.stopSpinner();
    logger.error('Failed to import advocacy documents', error);
    console.error('Detailed error:', error);
    throw error;
  }
} 