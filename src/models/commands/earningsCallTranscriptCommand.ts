import chalk from 'chalk';
import createCommand from './command.js';
import { getEarningCallTranscriptsList } from '../../helpers/FinancialModelingPrepHelper.js';
import OpenAIService from '../../services/OpenAIService.js';
import EarningsCallTranscript from '../financialModelingPrep/EarningsCallTranscript.js';
import FileReadWriteService from '../../services/FileReadWriteService.js';

const earningsCallTranscriptCommand = createCommand(
  'earnings-calls',
  ['earnings'],
  `Downloads Earning Call Transcript for specified company and saves them to long term memory.\n
    Usage: /earnings-calls aapl\n`,

  async (args: string[], output: NodeJS.WriteStream) => {
    if (Array.isArray(args) && !args.length) {
      output.write(chalk.red('Invalid number of arguments. Usage: /earnings-calls aapl\n'));
      return;
    }

    // This is where we make the call here to download from
    var symbol = args[0].toUpperCase();

    // calls API to download data
    var transcripts: Array<EarningsCallTranscript> = await getEarningCallTranscriptsList(symbol);

    for (const transcript of transcripts) {
      // Summarize Transcript using OpenAI
      // var transcriptSummary = await OpenAIService.getInstance().summarizeEarningsTranscript(
      //   transcript.content
      // );
      // transcript.content = transcriptSummary;

      // Write Summarized Transcript to File
      var write = await FileReadWriteService.getInstance().saveEarningsCallTranscriptsToTextFile(symbol, transcript);
    }
  }
);

export default earningsCallTranscriptCommand;
