import chalk from 'chalk';
import createCommand from './command.js';

const generateReportCommand = createCommand(
  'generate-report',
  ['generate'],
  `Generates a report for specified company answering specific prompts to gather data.\n
   Usage: /generate-report aapl\n`,

  async (args: string[], output: NodeJS.WriteStream) => {
    if (Array.isArray(args) && !args.length) {
      output.write(chalk.red('Invalid number of arguments. Usage: /generate-report aapl\n'));
      return;
    }

    // This is where we make the call here to download from
    var symbol = args[0].toUpperCase();

    console.log('Generating Company Report for ' + symbol);
  }
);

export default generateReportCommand;
