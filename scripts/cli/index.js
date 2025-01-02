#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import debug from 'debug';

const log = debug('site-cli');
const program = new Command();

// Set up basic program information
program
  .name('site')
  .description('CLI tool for managing website content and data')
  .version('0.1.0');

// Helper for interactive mode
async function interactive() {
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'What would you like to do?',
      choices: [
        { name: 'Fetch new content', value: 'fetch' },
        { name: 'Validate existing content', value: 'validate' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  if (mode === 'exit') {
    console.log(chalk.blue('Goodbye!'));
    process.exit(0);
  }

  // We'll implement these modes later
  console.log(chalk.yellow(`${mode} mode selected - to be implemented`));
}

// Basic command structure
program
  .command('interactive')
  .description('Run in interactive mode')
  .action(interactive);

// Example direct command (we'll add more later)
program
  .command('hello')
  .description('Test command - says hello')
  .action(() => {
    console.log(chalk.green('Hello! CLI is working!'));
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