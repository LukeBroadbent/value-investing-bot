import chalk from 'chalk';
import createCommand from './command.js';
import { getNewsStories } from '../../helpers/FinancialModelingPrepHelper.js';
import FileReadWriteService from '../../services/FileReadWriteService.js';
import { TimeFrame, isFilteredNewsStory } from '../../utils.js';
import NewsStory from '../financialModelingPrep/NewsStory.js';
import WebScraperService from '../../services/WebScraperService.js';
import OpenAIService from '../../services/OpenAIService.js';
import NewsMemoryService from '../../services/NewsMemoryService.js';

const downloadAllCommand = createCommand(
  'download-all',
  ['download', 'all'],
  `Downloads all information about specified company and saves to long term memory.\n
   Usage: /download-all aapl\n`,

  async (args: string[], output: NodeJS.WriteStream) => {
    if (Array.isArray(args) && !args.length) {
      output.write(chalk.red('Invalid number of arguments. Usage: /download-all aapl\n'));
      return;
    }

    // This is where we make the call here to download from
    var symbol = args[0].toUpperCase();

    console.log(symbol)

  }
);

export default downloadAllCommand;
