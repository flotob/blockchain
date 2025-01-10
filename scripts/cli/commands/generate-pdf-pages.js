import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { fromPath } from 'pdf2pic';
import { Logger } from '../lib/logger.js';
import { PDFDocument } from 'pdf-lib';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

async function getPdfDimensions(pdfPath) {
  const pdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(0);
  const { width, height } = page.getSize();
  return { width, height, pageCount: pdfDoc.getPageCount() };
}

async function generatePdfPages(pdfPath, options = { verbose: false, overwriteImages: false }) {
  const logger = new Logger(options.verbose);
  
  try {
    logger.debug(`Processing PDF: ${pdfPath}`);
    
    // Get PDF directory and name
    const pdfDir = path.dirname(pdfPath);
    const pdfName = path.basename(pdfPath, '.pdf');
    const pagesDir = path.join(pdfDir, 'pages');
    
    // Get PDF dimensions and page count first (we need this for the YAML regardless)
    const { width, height, pageCount } = await getPdfDimensions(pdfPath);
    
    // Check if first page exists (as indicator for all pages)
    const firstPagePath = path.join(pagesDir, `${pdfName}.1.jpg`);
    const imagesExist = await fs.access(firstPagePath).then(() => true).catch(() => false);
    
    if (imagesExist && !options.overwriteImages) {
      logger.debug('Page images already exist, skipping conversion');
      // Still update the YAML with page count
      await updateAdvocacyData(pdfPath, pageCount, logger);
      return [];
    }
    
    // Ensure pages directory exists
    await fs.mkdir(pagesDir, { recursive: true });

    const isPortrait = height > width;
    
    // Setup conversion options based on orientation
    // We'll set the longer dimension to 1200px and let the other scale proportionally
    const convertOptions = {
      density: 150,
      format: "jpg",
      saveFilename: pdfName,
      savePath: pagesDir
    };

    if (isPortrait) {
      convertOptions.height = 1200;
    } else {
      convertOptions.width = 1200;
    }
    
    logger.debug(`PDF orientation: ${isPortrait ? 'portrait' : 'landscape'}`);
    logger.debug(`Original dimensions: ${width.toFixed(0)}x${height.toFixed(0)}`);
    logger.debug(`Total pages: ${pageCount}`);
    logger.debug('Converting PDF pages to images...');
    
    const convert = fromPath(pdfPath, convertOptions);
    const pageFiles = await convert.bulk(-1); // Convert all pages
    
    logger.debug(`Generated ${pageFiles.length} page images`);
    
    // Update advocacy data with page count
    await updateAdvocacyData(pdfPath, pageCount, logger);
    
    return pageFiles;
  } catch (error) {
    logger.error(`Failed to generate PDF pages: ${error.message}`);
    throw error;
  }
}

async function updateAdvocacyData(pdfPath, pageCount, logger) {
  try {
    const advocacyDataPath = path.join(REPO_ROOT, '_data', 'advocacy.yml');
    const advocacyData = yaml.load(await fs.readFile(advocacyDataPath, 'utf8'));
    
    // Convert absolute path to relative for matching
    const relativePdfPath = pdfPath.replace(REPO_ROOT, '').replace(/\\/g, '/');
    
    let anyChanges = false;
    
    // Update page count in advocacy data
    for (const [org, orgData] of Object.entries(advocacyData)) {
      if (orgData.documents) {
        for (const doc of orgData.documents) {
          if (doc.pdf_url === relativePdfPath) {
            // Always update total_pages since it's missing from the YAML
            doc.total_pages = pageCount;
            anyChanges = true;
            logger.debug(`Added page count for ${relativePdfPath}: ${pageCount} pages`);
            break;
          }
        }
      }
    }
    
    if (anyChanges) {
      // Create backup of current file
      const backupPath = `${advocacyDataPath}.bak`;
      await fs.copyFile(advocacyDataPath, backupPath);
      logger.debug(`Created backup at ${backupPath}`);
      
      // Write updated data back to file
      await fs.writeFile(advocacyDataPath, yaml.dump(advocacyData, { 
        lineWidth: -1,
        noRefs: true,
        sortKeys: false  // Preserve key order
      }), 'utf8');
      logger.debug('Updated advocacy data file with page count');
    } else {
      logger.debug(`No matching document found for ${relativePdfPath}`);
    }
  } catch (error) {
    logger.error('Failed to update advocacy data:', error);
  }
}

async function processAllPdfs(options = { verbose: false, overwriteImages: false }) {
  const logger = new Logger(options.verbose);
  const pdfDir = path.join(REPO_ROOT, 'assets', 'pdf');
  
  try {
    // Get all organization directories
    const orgs = await fs.readdir(pdfDir);
    
    for (const org of orgs) {
      if (org.startsWith('.')) continue;
      
      const orgPath = path.join(pdfDir, org);
      const stat = await fs.stat(orgPath);
      if (!stat.isDirectory()) continue;
      
      // Process PDFs in org directory
      const files = await fs.readdir(orgPath);
      const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
      
      for (const pdfFile of pdfFiles) {
        const pdfPath = path.join(orgPath, pdfFile);
        logger.debug(`Processing ${org}/${pdfFile}`);
        await generatePdfPages(pdfPath, options);
      }
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to process PDFs:', error);
    throw error;
  }
}

export { generatePdfPages, processAllPdfs }; 