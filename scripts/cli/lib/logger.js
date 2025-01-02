import chalk from 'chalk';
import ora from 'ora';

export class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.spinner = null;
  }

  debug(...args) {
    if (this.verbose) {
      console.log(chalk.gray('[debug]'), ...args);
    }
  }

  info(...args) {
    console.log(chalk.blue('[info]'), ...args);
  }

  warn(...args) {
    console.log(chalk.yellow('[warn]'), ...args);
  }

  error(...args) {
    console.error(chalk.red('[error]'), ...args);
  }

  success(...args) {
    console.log(chalk.green('✔'), ...args);
  }

  startSpinner(text) {
    if (this.spinner) {
      this.spinner.stop();
    }
    this.spinner = ora({
      text,
      color: 'blue'
    }).start();
  }

  stopSpinner() {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
} 