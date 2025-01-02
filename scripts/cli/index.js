#!/usr/bin/env node

console.log('CLI Starting...');

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import debug from 'debug';
import { updateYouTubeData } from './commands/youtube.js';
import { updateEventData } from './commands/events.js';

console.log('Imports completed');

const log = debug('site-cli');
const program = new Command();

// Set up basic program information
program
  .name('site')
  .description('CLI tool for managing website content and data')
  .version('0.1.0')
  .option('-v, --verbose', 'enable verbose logging');

// Helper for interactive mode
async function interactive() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Update Everything', value: 'update-all' },
        { name: 'Update Individual Sections', value: 'update-individual' },
        { name: 'Validate Content', value: 'validate' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  if (action === 'exit') {
    console.log(chalk.blue('Goodbye!'));
    process.exit(0);
  }

  if (action === 'update-individual') {
    const { section } = await inquirer.prompt([
      {
        type: 'list',
        name: 'section',
        message: 'Which section would you like to update?',
        choices: [
          { name: 'Interviews (YouTube)', value: 'youtube' },
          { name: 'Events', value: 'events' },
          { name: 'Back', value: 'back' }
        ]
      }
    ]);

    if (section === 'back') {
      return interactive();
    }

    try {
      if (section === 'youtube') {
        await updateYouTubeData({ verbose: program.opts().verbose });
      } else if (section === 'events') {
        await updateEventData({ verbose: program.opts().verbose });
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      console.error(chalk.red('Stack trace:'), error.stack);
      process.exit(1);
    }
    return;
  }

  if (action === 'update-all') {
    console.log(chalk.yellow('Starting update of all sections...'));
    try {
      await updateYouTubeData({ verbose: program.opts().verbose });
      await updateEventData({ verbose: program.opts().verbose });
      console.log(chalk.green('All sections updated successfully!'));
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      console.error(chalk.red('Stack trace:'), error.stack);
      process.exit(1);
    }
    return;
  }

  console.log(chalk.yellow(`${action} mode selected - to be implemented`));
}

// Command structure
program
  .command('interactive')
  .description('Run in interactive mode')
  .action(interactive);

program
  .command('update-all')
  .description('Update all content sections')
  .action(async () => {
    try {
      await updateYouTubeData({ verbose: program.opts().verbose });
      await updateEventData({ verbose: program.opts().verbose });
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      console.error(chalk.red('Stack trace:'), error.stack);
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Update a specific section')
  .argument('<section>', 'Section to update (youtube|events)')
  .action(async (section) => {
    console.log('Update command triggered for section:', section);
    try {
      if (section === 'youtube') {
        console.log('Starting YouTube update...');
        const result = await updateYouTubeData({ verbose: program.opts().verbose });
        console.log('YouTube update completed with result:', result);
      } else if (section === 'events') {
        await updateEventData({ verbose: program.opts().verbose });
      } else {
        console.log(chalk.yellow(`Unknown section: ${section}`));
      }
    } catch (error) {
      console.error(chalk.red('Error in update command:'), error);
      console.error(chalk.red('Stack trace:'), error.stack);
      process.exit(1);
    }
  });

// Error handling
program.exitOverride();
try {
  // If no args, default to interactive mode
  if (process.argv.length === 2) {
    interactive();
  } else {
    program.parse();
  }
} catch (err) {
  console.error(chalk.red('CLI Error:'), err);
  console.error(chalk.red('Stack trace:'), err.stack);
  process.exit(1);
} 