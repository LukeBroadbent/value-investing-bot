import chalk from 'chalk';
import createCommand from './command.js';
import { getFinancialData } from '../../helpers/FinancialModelingPrepHelper.js';
import FileReadWriteService from '../../services/FileReadWriteService.js';
import { getKeyValuePairsFromFinancialData } from '../../utils.js';
import FinancialData from '../financialModelingPrep/FinancialData.js';
import LongTermMemoryService from '../../services/LongTermMemoryService.js';


const financialDataCommand = createCommand(
  'financial-data',
  ['financials', 'financial'],
  `Downloads specified company's finanical reports and saves them to long term memory.\n
   Usage: /financial-reports aapl\n`,

  async (args: string[], output: NodeJS.WriteStream) => {
    if (Array.isArray(args) && !args.length) {
      output.write(chalk.red('Invalid number of arguments. Usage: /financial-reports aapl\n'));
      return;
    }

    // This is where we make the call here to download from
    var symbol = args[0].toUpperCase();

    // calls API to download data
    var yearlyData: Array<FinancialData> = await getFinancialData(symbol);

    for (const year of yearlyData) {
      // Write Yearly Financials to File
      var write = await FileReadWriteService.getInstance().saveFinancialData(symbol, year);

      var keyValuePairs = getKeyValuePairsFromFinancialData(JSON.parse(JSON.stringify(year, null, 4)));

      // Build key value string to be embedded for database
      var stringsToEmbed: string[] = [];
      keyValuePairs.forEach((keyValue) => {
        stringsToEmbed.push(year.financial_year + '_' + symbol + '_' + keyValue.key + '_' + keyValue.value);
      });

      // Embed and Write to Chroma DB
      await LongTermMemoryService.getInstance().addFinancialDataToLongTermMemory(stringsToEmbed)

    }

  }
);

export default financialDataCommand;
