import chalk from 'chalk';
import ora from 'ora';

export class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.spinner = null;
  }

  debug(message) {
    if (this.verbose) {
      if (this.spinner) {
        this.spinner.stop();
      }
      console.log(chalk.gray(`[debug] ${message}`));
      if (this.spinner) {
        this.spinner.start();
      }
    }
  }

  error(message, error) {
    if (this.spinner) {
      this.spinner.stop();
    }
    console.error(chalk.red(`[error] ${message}`));
    if (error && this.verbose) {
      console.error(chalk.red(error.stack || error));
    }
    if (this.spinner) {
      this.spinner.start();
    }
  }

  success(message) {
    if (this.spinner) {
      this.spinner.stop();
    }
    console.log(chalk.green(`✔ ${message}`));
    if (this.spinner) {
      this.spinner.start();
    }
  }

  warn(message) {
    if (this.spinner) {
      this.spinner.stop();
    }
    console.warn(chalk.yellow(`⚠ ${message}`));
    if (this.spinner) {
      this.spinner.start();
    }
  }

  startSpinner(message) {
    if (this.spinner) {
      this.spinner.stop();
    }
    this.spinner = ora({
      text: message,
      spinner: 'dots'
    }).start();
  }

  updateSpinner(message) {
    if (this.spinner) {
      this.spinner.text = message;
    } else {
      console.log(message);
    }
  }

  stopSpinner() {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
} 