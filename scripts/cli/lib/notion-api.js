import { Client } from '@notionhq/client';
import chalk from 'chalk';

export class NotionAPI {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Notion API key is required');
    }
    this.notion = new Client({ auth: apiKey });
  }

  // Get children of a page or database
  async getChildren(blockId, retries = 3) {
    if (!blockId) {
      throw new Error('Block ID is required');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(chalk.blue(`Fetching children for block: ${blockId}`));
        const response = await this.notion.blocks.children.list({ 
          block_id: blockId,
          page_size: 100
        });
        
        if (!response.results) {
          throw new Error(`No children found for block ID: ${blockId}`);
        }

        console.log(chalk.blue(`Found ${response.results.length} children`));
        console.log(chalk.blue(`Types: ${response.results.map(b => b.type).join(', ')}`));

        const items = response.results.map(block => ({
          id: block.id,
          type: block.type,
          hasChildren: block.has_children,
          title: this._getBlockTitle(block)
        }));

        if (items.length === 0) {
          console.log(chalk.yellow(`No items found in page ${blockId}`));
        }

        return items;
      } catch (error) {
        console.error(chalk.red(`Attempt ${attempt} failed:`, error.message));
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

  // Get slide pages (child pages) of a project
  async getSlidePages(projectPageId, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(chalk.blue(`Fetching slides for project: ${projectPageId}`));
        const response = await this.notion.blocks.children.list({
          block_id: projectPageId,
          page_size: 100
        });

        if (!response.results) {
          throw new Error(`No slides found for project: ${projectPageId}`);
        }

        console.log(chalk.blue(`Found ${response.results.length} blocks`));
        console.log(chalk.blue(`Block types: ${response.results.map(b => b.type).join(', ')}`));

        // Extract page IDs from paragraph links
        const slidePages = [];
        let index = 1;

        for (const block of response.results) {
          if (block.type === 'paragraph' && block.paragraph.rich_text.length > 0) {
            for (const text of block.paragraph.rich_text) {
              if (text.href && text.href.includes('notion.so/')) {
                // Extract page ID from the URL - it's the last 32 characters
                const pageId = text.href.match(/[a-f0-9]{32}/)?.[0];
                if (pageId) {
                  slidePages.push({
                    id: pageId,
                    title: text.plain_text,
                    index: index++
                  });
                  console.log(chalk.blue(`Found slide: ${text.plain_text} (${pageId})`));
                }
              }
            }
          }
        }

        console.log(chalk.blue(`Found ${slidePages.length} slide pages`));
        if (slidePages.length > 0) {
          console.log(chalk.blue('Slide titles:', slidePages.map(s => s.title).join(', ')));
        }

        if (slidePages.length === 0) {
          console.log(chalk.yellow('No slide pages found in project'));
        }

        return slidePages;
      } catch (error) {
        console.error(chalk.red(`Attempt ${attempt} failed:`, error.message));
        if (attempt === retries) {
          throw new Error(`Failed to fetch slides for ${projectPageId} after ${retries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Get slide content and convert to markdown
  async getSlideContent(slideId, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const blocks = await this.notion.blocks.children.list({
          block_id: slideId,
          page_size: 100
        });

        if (!blocks.results) {
          throw new Error(`No content found for slide: ${slideId}`);
        }

        return this._blocksToMarkdown(blocks.results);
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed to fetch slide ${slideId} after ${retries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Convert Notion blocks to markdown
  _blocksToMarkdown(blocks) {
    let markdown = '';

    for (const block of blocks) {
      switch (block.type) {
        case 'paragraph':
          markdown += this._richTextToMarkdown(block.paragraph.rich_text) + '\n\n';
          break;
        
        case 'heading_1':
          markdown += '# ' + this._richTextToMarkdown(block.heading_1.rich_text) + '\n\n';
          break;
        
        case 'heading_2':
          markdown += '## ' + this._richTextToMarkdown(block.heading_2.rich_text) + '\n\n';
          break;
        
        case 'heading_3':
          markdown += '### ' + this._richTextToMarkdown(block.heading_3.rich_text) + '\n\n';
          break;

        case 'bulleted_list_item':
          markdown += '- ' + this._richTextToMarkdown(block.bulleted_list_item.rich_text) + '\n';
          break;

        case 'numbered_list_item':
          markdown += '1. ' + this._richTextToMarkdown(block.numbered_list_item.rich_text) + '\n';
          break;

        case 'code':
          markdown += '```' + (block.code.language || '') + '\n';
          markdown += this._richTextToMarkdown(block.code.rich_text) + '\n';
          markdown += '```\n\n';
          break;

        case 'quote':
          markdown += '> ' + this._richTextToMarkdown(block.quote.rich_text) + '\n\n';
          break;

        case 'image':
          const caption = block.image.caption?.length > 0 
            ? this._richTextToMarkdown(block.image.caption) 
            : '';
          markdown += `![${caption}](${block.image.file?.url || block.image.external?.url})\n\n`;
          break;

        default:
          console.log(chalk.yellow(`Unsupported block type: ${block.type}`));
      }
    }

    return markdown.trim();
  }

  // Convert Notion rich text to markdown
  _richTextToMarkdown(richText) {
    if (!richText) return '';
    
    return richText.map(text => {
      let content = text.plain_text;
      
      if (text.annotations.bold) content = `**${content}**`;
      if (text.annotations.italic) content = `*${content}*`;
      if (text.annotations.strikethrough) content = `~~${content}~~`;
      if (text.annotations.code) content = '`' + content + '`';
      if (text.href) content = `[${content}](${text.href})`;
      
      return content;
    }).join('');
  }
} 