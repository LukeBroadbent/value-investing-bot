import chalk from 'chalk';
import createCommand from './command.js';
import { getPressReleases } from '../../helpers/FinancialModelingPrepHelper.js';
import FileReadWriteService from '../../services/FileReadWriteService.js';
import LongTermMemoryService from '../../services/LongTermMemoryService.js';
import PressRelease from '../financialModelingPrep/PressRelease.js';

const pressReleasesCommand = createCommand(
  'press-releases',
  ['press', 'pr'],
  `Downloads specified company's Press Releases and saves them to long term memory.\n
   Usage: /press-releases aapl\n`,

  async (args: string[], output: NodeJS.WriteStream) => {
    if (Array.isArray(args) && !args.length) {
      output.write(chalk.red('Invalid number of arguments. Usage: /press-releases aapl\n'));
      return;
    }

    // This is where we make the call here to download from
    var symbol = args[0].toUpperCase();
    var pressReleases: Array<PressRelease> = await getPressReleases(symbol);

    for (const release of pressReleases) {
      // Write Yearly Financials to File
      var write = await FileReadWriteService.getInstance().savePressReleasesToTextFile(symbol, release);
    }

    // Embed and Write to Chroma DB
    console.log("Embedding Press Releases for + " + symbol + "...")
    //await LongTermMemoryService.getInstance().addFinancialDataToLongTermMemory(stringsToEmbed);
  }
);

export default pressReleasesCommand;
