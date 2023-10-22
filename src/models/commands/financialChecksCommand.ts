import chalk from 'chalk';
import createCommand from './command.js';
import { getFinancialData } from '../../helpers/FinancialModelingPrepHelper.js';
import FileReadWriteService, { doesFileExistInDirectory } from '../../services/FileReadWriteService.js';
import { Directory, getNumericalKeyValuePairsFromFinancialData } from '../../utils.js';
import FinancialData from '../financialModelingPrep/FinancialData.js';
import LongTermMemoryService from '../../services/LongTermMemoryService.js';

const financialChecksCommand = createCommand(
  'financial-checks',
  ['checks'],
  `Downloads specified company's finanical data and saves each type in an easily readable string for the bot.\n
   Usage: /financial-checks aapl\n`,

  async (args: string[], output: NodeJS.WriteStream) => {
    if (Array.isArray(args) && !args.length) {
      output.write(chalk.red('Invalid number of arguments. Usage: /financial-checks aapl\n'));
      return;
    }

    // This is where we make the call here to download from
    var symbol = args[0].toUpperCase();

    // calls API to download data
    var yearlyData: Array<FinancialData> = await getFinancialData(symbol);

    // gather value investing numbers to also store
    console.log('Summarizing and Embedding Financial Data for ' + symbol + '...');

    // Income Statement Checks
    var revenues = [];
    var grossProfits = [];
    var operatingIncomes = [];
    var netIncomes = [];
    var dilutedEPS = [];

    var cashPosition = [];
    var longTermDebt = [];
    var shareHolderEquity = [];
    var retainedEarnings = [];

    var freeCashFlows = [];
    var operatingCashFlows = [];
    var cashFlowsFromInvestments = [];

    for (const year of yearlyData) {
      // Income Statement Checks
      revenues.push({ year: year.financial_year, revenue: year.income_statement.revenue });
      grossProfits.push({ year: year.financial_year, grossProfit: year.income_statement.grossProfit });
      operatingIncomes.push({ year: year.financial_year, operatingIncome: year.income_statement.operatingIncome });
      netIncomes.push({ year: year.financial_year, netIncome: year.income_statement.netIncome });
      dilutedEPS.push({ year: year.financial_year, epsdiluted: year.income_statement.epsdiluted });

      // Balance Sheet Checks
      cashPosition.push({
        year: year.financial_year,
        cashAndCashEquivalents: year.balance_sheet.cashAndCashEquivalents,
      });
      longTermDebt.push({ year: year.financial_year, longTermDebt: year.balance_sheet.longTermDebt });
      shareHolderEquity.push({ year: year.financial_year, totalEquity: year.balance_sheet.totalEquity });
      retainedEarnings.push({ year: year.financial_year, retainedEarnings: year.balance_sheet.retainedEarnings });

      // Cash Flows Checks
      freeCashFlows.push({ year: year.financial_year, freeCashFlow: year.cash_flow.freeCashFlow });
      operatingCashFlows.push({ year: year.financial_year, operatingCashFlow: year.cash_flow.operatingCashFlow });
      //cashFlowsFromInvestments.push({year: year.financial_year, freeCashFlow: year.cash_flow.netCashUsedForInvestingActivites})
    }

    var stringsToEmbed = [
      symbol + '_revenue_all_' + JSON.stringify(revenues),
      symbol + '_grossProfit_all_' + JSON.stringify(grossProfits),
      symbol + '_operatingIncome_all_' + JSON.stringify(operatingIncomes),
      symbol + '_netIncome_all_' + JSON.stringify(netIncomes),
      symbol + '_dilutedEPS_all_' + JSON.stringify(dilutedEPS),
      symbol + '_cashPosition_all_' + JSON.stringify(cashPosition),
      symbol + '_longTermDebt_all_' + JSON.stringify(longTermDebt),
      symbol + '_shareHolderEquity_all_' + JSON.stringify(shareHolderEquity),
      symbol + '_retainedEarnings_all_' + JSON.stringify(retainedEarnings),
      symbol + '_freeCashFlows_all_' + JSON.stringify(freeCashFlows),
      symbol + '_operatingCashFlows_all_' + JSON.stringify(operatingCashFlows),
    ];

    // Embed and Write to Chroma DB
    await LongTermMemoryService.getInstance().addFinancialDataToLongTermMemory(stringsToEmbed);
  }
);

export default financialChecksCommand;
