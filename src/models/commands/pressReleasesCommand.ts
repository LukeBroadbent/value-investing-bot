import chalk from 'chalk';
import createCommand from './command.js';
import { getPressReleases } from '../../helpers/FinancialModelingPrepHelper.js';
import FileReadWriteService, { doesFileExistInDirectory } from '../../services/FileReadWriteService.js';
import LongTermMemoryService from '../../services/LongTermMemoryService.js';
import PressRelease from '../financialModelingPrep/PressRelease.js';
import { Directory } from '../../utils.js';

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

    // Iterates through all downloaded Press Releases
    for (const release of pressReleases) {
      const fileName = symbol.toLowerCase() + '-' + release.date.split(' ')[0] + '-release.txt';

      // Stores Press Release if it hasn't been downloaded
      if (!doesFileExistInDirectory(symbol, fileName, Directory.Press)) {
        // Write Yearly Financials to File
        var write = await FileReadWriteService.getInstance().savePressReleasesToTextFile(symbol, fileName, release);

        // Embed Press Release File
        console.log('Embedding Press Releases ' + fileName + '...');
        await LongTermMemoryService.getInstance().addPressReleaseToLongTermMemory(symbol, fileName);
      }
    }
  }
);

export default pressReleasesCommand;
