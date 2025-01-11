import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { YAMLHandler } from '../lib/yaml.js';
import { Logger } from '../lib/logger.js';
import { fromPath } from 'pdf2pic';
import { analyzeDocument } from '../lib/vision-analyzer.js';
import { generatePdfPages } from './generate-pdf-pages.js';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

// Relative paths from repo root
const IMPORT_DIR = 'import/advocacy';
const ASSETS_DIR = 'assets/pdf';
const PREVIEW_DIR = 'assets/images/advocacy';
const DATA_FILE = '_data/advocacy.yml';
const COLLECTION_DIR = '_advocacy';

function extractDateFromFilename(filename) {
  // Try to match YYYY-MM-DD pattern first
  const fullDateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  if (fullDateMatch) {
    return fullDateMatch[1];
  }

  // Try to match YYYY pattern
  const yearMatch = filename.match(/^(\d{4})/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }

  // Return null if no date pattern found
  return null;
}

async function getPdfDimensions(pdfPath) {
  const pdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(0);
  const { width, height } = page.getSize();
  return { width, height };
}

async function generatePreview(pdfPath, outputName) {
  try {
    // Ensure preview directory exists
    const previewDir = path.join(REPO_ROOT, PREVIEW_DIR);
    await fs.mkdir(previewDir, { recursive: true });

    console.log(`Generating preview for ${pdfPath}`);

    // Get PDF dimensions first
    const { width, height } = await getPdfDimensions(pdfPath);
    const isPortrait = height > width;

    // Base options
    const options = {
      density: 150,
      saveFilename: outputName,
      savePath: previewDir,
      format: "jpg",
    };

    // Set dimensions based on orientation
    // For portrait: height = 1067, width will scale proportionally
    // For landscape: width = 800, height will scale proportionally
    if (isPortrait) {
      options.height = 1067; // Standard A4 height at this scale
    } else {
      options.width = 800; // Standard A4 width at this scale
    }
    
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
  const requiredFields = ['title', 'date', 'type', 'language', 'pdf_url', 'tags', 'total_pages'];
  const missingFields = requiredFields.filter(field => !(field in document));
  
  if (!document || missingFields.length > 0) {
    console.error('Document is missing required fields:', document);
    throw new Error(`Document is missing required fields: ${missingFields.join(', ')}`);
  }

  const slug = document.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filePath = path.join(REPO_ROOT, COLLECTION_DIR, `${org}-${slug}.md`);
  
  const frontMatter = [
    '---',
    'layout: pdf',
    `title: "${document.title}"`,
    `date: ${document.date || 'null'}`,
    `organization: ${org}`,
    `type: ${document.type}`,
    `language: ${document.language}`,
    `pdf_url: "${document.pdf_url}"`,
    `preview_image: "${document.preview_image}"`,
    `file_size: ${document.file_size}`,
    `total_pages: ${document.total_pages}`,
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
    `- Pages: ${document.total_pages}`,
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

    // Extract date from filename
    const date = extractDateFromFilename(filename);
    if (!date) {
      console.warn(`Warning: Could not extract date from filename: ${filename}`);
    }

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
    const targetPath = path.join(assetsPath, path.basename(filePath));
    await fs.copyFile(filePath, targetPath);

    // Generate page images
    const pageFiles = await generatePdfPages(targetPath);
    const totalPages = pageFiles.length;

    // Create document object, overriding the date from OpenAI with our filename date
    const document = {
      ...metadata,
      date: date || metadata.date, // Fallback to OpenAI date if filename date not found
      pdf_url: path.join('/', ASSETS_DIR, org, path.basename(filePath)),
      preview_image: previewPath,
      file_size: fileSize,
      total_pages: totalPages
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
          const document = await processDocument(sourcePath, org);
          if (!document) continue;
          
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
    logger.error('Failed to import advocacy documents:', error);
    throw error;
  }
} 