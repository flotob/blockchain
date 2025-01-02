import { config } from 'dotenv';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { NotionAPI } from '../lib/notion-api.js';
import { Logger } from '../lib/logger.js';

config();

// Navigation history stack
let navigationStack = [];

export async function browseNotion(options = { verbose: false }) {
  const logger = new Logger(options.verbose);

  try {
    const apiKey = process.env.NOTION_API_KEY;
    const rootPageId = process.env.NOTION_ROOT_PAGE;

    if (!apiKey) {
      throw new Error('NOTION_API_KEY environment variable is not set');
    }
    if (!rootPageId) {
      throw new Error('NOTION_ROOT_PAGE environment variable is not set');
    }

    const notion = new NotionAPI(apiKey, rootPageId);
    
    // Start with root navigation
    await navigatePages(notion, logger);
    
  } catch (error) {
    logger.error('Failed to browse Notion:', error);
    return false;
  }
}

async function navigatePages(notion, logger, currentPageId = null) {
  try {
    let items = [];
    
    // Add navigation options
    const choices = [];
    
    if (navigationStack.length > 0) {
      choices.push({
        name: '📂 .. (Go back)',
        value: 'back'
      });
    }

    if (currentPageId) {
      // Get children of current page
      items = await notion.getChildren(currentPageId);
    } else {
      // Root level - start with a search
      const searchResult = await notion.searchPages('');
      items = searchResult;
    }

    // Add items to choices
    items.forEach(item => {
      choices.push({
        name: `${item.hasChildren ? '📂' : '📄'} ${item.title}`,
        value: item.id
      });
    });

    // Add search option
    choices.push(new inquirer.Separator());
    choices.push({
      name: '🔍 Search pages...',
      value: 'search'
    });

    // Add exit option
    choices.push({
      name: '❌ Exit',
      value: 'exit'
    });

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select a page or action:',
        choices,
        pageSize: 20
      }
    ]);

    if (action === 'exit') {
      return;
    }

    if (action === 'back') {
      navigationStack.pop();
      const previousPage = navigationStack[navigationStack.length - 1];
      return navigatePages(notion, logger, previousPage);
    }

    if (action === 'search') {
      const { query } = await inquirer.prompt([
        {
          type: 'input',
          name: 'query',
          message: 'Enter search term:'
        }
      ]);

      const searchResults = await notion.searchPages(query);
      logger.info(`Found ${searchResults.length} results`);
      
      const { selectedPage } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedPage',
          message: 'Select a page:',
          choices: [
            { name: '📂 .. (Go back)', value: 'back' },
            ...searchResults.map(page => ({
              name: `${page.hasChildren ? '📂' : '📄'} ${page.title}`,
              value: page.id
            }))
          ]
        }
      ]);

      if (selectedPage === 'back') {
        return navigatePages(notion, logger, currentPageId);
      }

      navigationStack.push(selectedPage);
      return navigatePages(notion, logger, selectedPage);
    }

    // Navigate to selected page
    navigationStack.push(action);
    return navigatePages(notion, logger, action);

  } catch (error) {
    logger.error('Navigation failed:', error);
    return false;
  }
} 