#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import debug from 'debug';
import { updateYouTubeData } from './commands/youtube.js';
import { updateEventData } from './commands/events.js';

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

    if (section === 'youtube') {
      await updateYouTubeData({ verbose: program.opts().verbose });
    } else if (section === 'events') {
      await updateEventData({ verbose: program.opts().verbose });
    }
    return;
  }

  if (action === 'update-all') {
    console.log(chalk.yellow('Starting update of all sections...'));
    await updateYouTubeData({ verbose: program.opts().verbose });
    await updateEventData({ verbose: program.opts().verbose });
    console.log(chalk.green('All sections updated successfully!'));
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
    await updateYouTubeData({ verbose: program.opts().verbose });
    await updateEventData({ verbose: program.opts().verbose });
  });

program
  .command('update')
  .description('Update a specific section')
  .argument('<section>', 'Section to update (youtube|events)')
  .action(async (section) => {
    if (section === 'youtube') {
      await updateYouTubeData({ verbose: program.opts().verbose });
    } else if (section === 'events') {
      await updateEventData({ verbose: program.opts().verbose });
    } else {
      console.log(chalk.yellow(`Unknown section: ${section}`));
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
  log(err);
  process.exit(1);
} 