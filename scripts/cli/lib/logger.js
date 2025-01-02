import chalk from 'chalk';
import ora from 'ora';

export class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.spinner = null;
  }

  startSpinner(text) {
    this.spinner = ora(text).start();
    return this.spinner;
  }

  stopSpinner() {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  success(message) {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    } else {
      console.log(chalk.green('✓'), message);
    }
  }

  error(message, error) {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    } else {
      console.error(chalk.red('✗'), message);
    }
    if (error && this.verbose) {
      console.error(chalk.red(error.stack || error));
    }
  }

  warn(message) {
    if (this.spinner) {
      const currentText = this.spinner.text;
      this.spinner.warn(message).start(currentText);
    } else {
      console.warn(chalk.yellow('⚠'), message);
    }
  }

  info(message) {
    if (this.spinner) {
      const currentText = this.spinner.text;
      this.spinner.info(message).start(currentText);
    } else {
      console.info(chalk.blue('ℹ'), message);
    }
  }

  debug(message) {
    if (this.verbose) {
      if (this.spinner) {
        const currentText = this.spinner.text;
        this.spinner.info(chalk.gray(message)).start(currentText);
      } else {
        console.debug(chalk.gray('➤'), message);
      }
    }
  }

  updateSpinner(text) {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }
} 