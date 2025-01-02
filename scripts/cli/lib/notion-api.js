import { Client } from '@notionhq/client';
import chalk from 'chalk';

export class NotionAPI {
  constructor(apiKey, rootPageId) {
    if (!apiKey) {
      throw new Error('Notion API key is required');
    }
    if (!rootPageId) {
      throw new Error('Notion root page ID is required');
    }
    this.notion = new Client({ auth: apiKey });
    this.rootPageId = rootPageId;
  }

  // Get children of a page or database
  async getChildren(blockId = this.rootPageId, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.notion.blocks.children.list({ 
          block_id: blockId,
          page_size: 100
        });
        
        if (!response.results) {
          throw new Error(`No children found for block ID: ${blockId}`);
        }

        const items = response.results.map(block => ({
          id: block.id,
          type: block.type,
          hasChildren: block.has_children,
          title: this._getBlockTitle(block)
        }));

        if (items.length === 0) {
          console.log(chalk.yellow(`No items found in ${blockId === this.rootPageId ? 'root page' : 'page'}`));
        }

        return items;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed to fetch children for ${blockId} after ${retries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Search pages
  async searchPages(query, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.notion.search({
          query,
          filter: { property: 'object', value: 'page' },
          page_size: 100,
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time'
          }
        });

        const items = response.results.map(page => ({
          id: page.id,
          title: page.properties?.title?.title?.[0]?.plain_text || 'Untitled',
          hasChildren: page.has_children
        }));

        if (items.length === 0) {
          console.log(chalk.yellow(`No pages found${query ? ` matching "${query}"` : ''}`));
        }

        return items;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed to search pages after ${retries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Fetch page content with retries
  async getPageContent(pageId, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const [pageInfo, blocks] = await Promise.all([
          this.notion.pages.retrieve({ page_id: pageId }),
          this.notion.blocks.children.list({ block_id: pageId })
        ]);

        if (!blocks.results) {
          throw new Error(`No content found for page ID: ${pageId}`);
        }

        return {
          title: pageInfo.properties?.title?.title?.[0]?.plain_text || 'Untitled',
          blocks: blocks.results
        };
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed to fetch page ${pageId} after ${retries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Helper to get block title based on type
  _getBlockTitle(block) {
    switch (block.type) {
      case 'child_page':
        return block.child_page?.title || 'Untitled Page';
      case 'child_database':
        return block.child_database?.title || 'Untitled Database';
      default:
        return block[block.type]?.rich_text?.[0]?.plain_text || `Untitled ${block.type}`;
    }
  }
} 