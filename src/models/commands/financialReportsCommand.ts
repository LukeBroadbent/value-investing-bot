import chalk from 'chalk';
import createCommand from './command.js';
import { getFinancialReports } from '../../helpers/FinancialModelingPrepHelper.js';
import OpenAIService from '../../services/OpenAIService.js';
import FileReadWriteService, { doesFileExistInDirectory } from '../../services/FileReadWriteService.js';
import FinancialReport from '../financialModelingPrep/FinancialReport.js';
import { Directory, getImportantExcertsFromFinancialReport } from '../../utils.js';

const financialReportsCommand = createCommand(
  'financial-reports',
  ['report', 'reports'],
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
    var reports: Array<FinancialReport> = await getFinancialReports(symbol);

    console.log('Summarizing Financial Reports for ' + symbol + '...');
    for (const report of reports) {
      // Check if report has already been created
      var filename = symbol + '-' + report.year + '-' + report.period;
      if (!doesFileExistInDirectory(symbol, filename, Directory.Reports)) {
        //Gather Important Text from financial report
        var excerts = await getImportantExcertsFromFinancialReport(report.json);

        // Summarizes all excerts from a financial report to be written to file
        var excertSummaries = await OpenAIService.getInstance().summarizeTextList(excerts);

        // Write Summarized Financial Reports to File
        var write = await FileReadWriteService.getInstance().saveFinancialReport(
          report.symbol,
          filename,
          excertSummaries
        );
      }

      // Embed reports and send to db
      console.log('Embedding Financial Reports for ' + symbol + '...');
    }
  }
);

export default financialReportsCommand;
