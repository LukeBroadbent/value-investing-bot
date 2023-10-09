import BalanceSheet from '../models/financialModelingPrep/BalanceSheet.js';
import CashFlows from '../models/financialModelingPrep/CashFlow.js';
import EarningsCallTranscript from '../models/financialModelingPrep/EarningsCallTranscript.js';
import FMPFinancialReport from '../models/financialModelingPrep/FMPFinancialReport.js';
import FMPFinancialReportDate from '../models/financialModelingPrep/FMPFinancialReportDate.js';
import FinancialData from '../models/financialModelingPrep/FinancialData.js';
import IncomeStatement from '../models/financialModelingPrep/IncomeStatement.js';
import Ratios from '../models/financialModelingPrep/Ratios.js';
import FinancialModelingPrepService from '../services/FinancialModelingPrepService.js';

const FMPService = FinancialModelingPrepService.getInstance();

export async function getFinancialData(symbol: string) {
  console.log('Downloading Financial Data for ' + symbol + '...');
  var financialData: Array<FinancialData> = []

  var annualIncomeStatements = await getAnnualIncomeStatements(symbol);
  var annualBalanceSheets = await getAnnualBalanceSheets(symbol);
  var annualCashFlows = await getAnnualCashFlowStatements(symbol);
  //var annualFinancialRatios = await getAnnualFinancialRatios(symbol);
  var min = Math.min(annualBalanceSheets.length, annualCashFlows.length, annualIncomeStatements.length)

  for (var i = 0; i < min; i++) {
    var year: FinancialData = new FinancialData()
    year.financial_year = annualIncomeStatements[i].calendarYear
    //console.log(annualIncomeStatements[i].calendarYear + " - " + annualBalanceSheets[i].calendarYear  + " - " + annualCashFlows[i].calendarYear)
    year.income_statement = annualIncomeStatements[i]
    year.balance_sheet = annualBalanceSheets[i]
    year.cash_flow = annualCashFlows[i]
    //year.ratios = annualFinancialRatios[i]
    financialData.push(year)
  }

  return financialData

}

// Requests Earnings Call Transcripts from API for a given stock and stores reports as txt file
export async function getEarningCallTranscriptsList(symbol: string) {
  console.log('Downloading Earnings Call Transcripts for ' + symbol + '...');
  var transcripts: Array<EarningsCallTranscript> = [];
  var dates = await FMPService.getEarningsCallDates(symbol);

  for (const date of Object.entries(dates as string)) {
    var [key, value] = date;
    var qtr = value[0];
    var year = value[1];

    var transcript = await FMPService.getEarningsCallTranscripts(symbol, qtr, year);
    var fmpEarningsCallTranscript = JSON.parse(JSON.stringify(transcript).slice(1, -1)) as EarningsCallTranscript;
    transcripts.push(fmpEarningsCallTranscript);
  }

  return transcripts;
}

// Requests Financial Reports from API for a given stock and stores reports as txt files
export async function getFinancialReports(symbol: string) {
  console.log('Downloading Financial Reports for ' + symbol + '...');
  var financialReportDates: Array<FMPFinancialReportDate> = await getFinancialReportDates(symbol);

  // Download Report JSON
  var financialReports: Array<FMPFinancialReport> = [];

  for (const date of financialReportDates) {

    // Annual Reports
    if (date.period === 'FY' && date.linkJson != null) {
      console.log('\t~ ' + date.date);
      var reportData = await FMPService.getFinancialReport(date.linkJson);
      var fmpFinanicalReport = new FMPFinancialReport(date.symbol, date.period, date.date, reportData as JSON);
      financialReports.push(fmpFinanicalReport);
    }

    // Quartetly Reports
    // if (date.period.includes('Q') && date.linkJson != null) {
    //   console.log('\t~ ' + date.date + ' - ' + date.period);
    //   var reportData = await FMPService.getFinancialReport(date.linkJson);
    //   var fmpFinanicalReport = new FMPFinancialReport(date.symbol, date.period, date.date, reportData as JSON);
    //   financialReports.push(fmpFinanicalReport);
    // }
  }
  return financialReports;
}

async function getFinancialReportDates(symbol: string) {
  var financialReportDates: Array<FMPFinancialReportDate> = [];
  var dates = await FMPService.getFinancialReportDates(symbol);

  Object.entries(dates as string).forEach((report) => {
    var [key, value] = report;
    var fmpFinancialReportDate = JSON.parse(JSON.stringify(value)) as FMPFinancialReportDate;
    financialReportDates.push(fmpFinancialReportDate);
  });

  return financialReportDates;
}

// Request Data from API and Creates an FMPStock Object that contains all data requested
// export async function getStock(stock: string) {
//   console.log('Gathering ' + stock + ' data...');
//   var fmpStock: FMPStock = new FMPStock();

//   if (!FileReadWriteService.getInstance().hasStockDataBeenRetrieved(stock)) {
//     // Download Data to Create FMPStock Object
//     fmpStock = (await downloadStockDataFromApi(stock)) as FMPStock;

//     // Write Stock to File
//     var write = await FileReadWriteService.getInstance().saveStockDataToFile(fmpStock.symbol, JSON.stringify(fmpStock));
//   } else {
//     var json = FileReadWriteService.getInstance().readStockDataFromFile(stock);
//     fmpStock = Object.assign(new FMPStock(), JSON.parse(json));

//     var updated = await gatherMissingFincancialData(fmpStock);

//     // Check if new financial records have been added
//     // var newReports = await isNewFinancialDataAvailable(fmpStock)
//     // if (newReports) {
//     //   // Download Full Stock Information again
//     //   console.log("New Reports Found. Downloading data")
//     //   fmpStock = await downloadStockDataFromApi(stock) as FMPStock

//     //   // Write Stock to File
//     //   await FileReadWriteService.getInstance().saveStockDataToFile(fmpStock.symbol, JSON.stringify(fmpStock))

//     // }

//     // Write Stock to File if new data was gathered
//     if (updated) {
//       await FileReadWriteService.getInstance().saveStockDataToFile(fmpStock.symbol, JSON.stringify(fmpStock));
//     }
//   }

//   return fmpStock;
// }

// Request Data from API for a list of Stocks and returns a list of FMPStock objects
// export async function getAllStockData(stocks: any) {
//   var stockList: Array<FMPStock> = [];
//   var counter = stocks.length;
//   for (const stock of stocks) {
//     counter--;
//     await getStock(stock).then((fmpStock) => {
//       if (fmpStock != undefined) {
//         stockList.push(fmpStock as FMPStock);
//       }
//     });
//   }
//   // Failed Tickers - Remove them from Ticker
//   StockTickerService.getInstance().updateTickerList();

//   return stockList;
// }

// Requests Data from the API that will be used for building AI Data Model
export async function getStockDataForAIDataModel(stock: string) {
  // Financial Reports
  //await getFinancialReports(stock)
  // Earnings Calls
  //await getEarningCallTranscripts(stock)
  // Press Releases
  //await getPressReleases(stock)
  // News Stories
  //await getNewsStories(stock);
}

// async function downloadStockDataFromApi(stock: string) {
//   var fmpStock: FMPStock = new FMPStock();

//   var quote = (await FMPService.getCompanyQuote(stock)) as string;
//   if (quote.length == 0) {
//     StockTickerService.getInstance().getFailedTickerList().push(stock);
//     return;
//   }
//   fmpStock = Object.assign(new FMPStock(), JSON.parse(JSON.stringify(quote).replace('[', '').replace(']', '')));

//   var profile = await FMPService.getCompanyProfile(stock);
//   fmpStock.companyProfile = Object.assign(
//     new FMPCompanyProfile(),
//     JSON.parse(JSON.stringify(profile).replace('[', '').replace(']', ''))
//   );

//   fmpStock.annualIncomeStatements = await getAnnualIncomeStatements(stock);
//   var reportDates: Array<String> = [];
//   fmpStock.annualIncomeStatements.forEach((incomestatement) => {
//     reportDates.push(incomestatement.date);
//   });

//   fmpStock.dailyCloses = await getDailyCloses(stock, reportDates);
//   fmpStock.annualBalanceSheets = await getAnnualBalanceSheets(stock);
//   fmpStock.annualCashFlows = await getAnnualCashFlowStatements(stock);
//   fmpStock.annualFinancialRatios = await getAnnualFinancialRatios(stock);
//   fmpStock.companyExecutives = await getCompanyExecutives(stock);
//   fmpStock.companyPeers = await getCompanyPeerList(stock);
//   fmpStock.financialReportDates = await getFinancialReportDates(stock);

//   return fmpStock;
// }

// Function written to gather missing finacial data for a stock that was created during the development process
// async function gatherMissingFincancialData(fmpStock: FMPStock) {
//   var updated = false;

//   if (fmpStock.companyProfile == undefined) {
//     var profile = await FMPService.getCompanyProfile(fmpStock.symbol);
//     fmpStock.companyProfile = Object.assign(
//       new FMPCompanyProfile(),
//       JSON.parse(JSON.stringify(profile).replace('[', '').replace(']', ''))
//     );
//     updated = true;
//   }

//   if (fmpStock.companyPeers == undefined) {
//     var competitors = await getCompanyPeerList(fmpStock.symbol);
//     fmpStock.companyPeers = competitors;
//     updated = true;
//   }

//   if (fmpStock.annualFinancialRatios == undefined) {
//     var ratios = await FMPService.getFinancialRatios(fmpStock.symbol, true);
//     var annualFinancialRatios: Array<FMPFinancialRatio> = [];
//     Object.entries(ratios as string).forEach((statement) => {
//       var [key, value] = statement;
//       var fmpFinancialRatio = JSON.parse(JSON.stringify(value)) as FMPFinancialRatio;
//       annualFinancialRatios.push(fmpFinancialRatio);
//     });
//     fmpStock.annualFinancialRatios = annualFinancialRatios;
//     updated = true;
//   }

//   if (fmpStock.companyExecutives == undefined) {
//     var executivesList: Array<FMPExecutive> = [];
//     var executives = await FMPService.getCompanyExecutives(fmpStock.symbol);
//     Object.entries(executives as string).forEach((executive) => {
//       var [key, value] = executive;
//       var fmpExecutive = JSON.parse(JSON.stringify(value)) as FMPExecutive;
//       executivesList.push(fmpExecutive);
//     });
//     fmpStock.companyExecutives = executivesList;
//     updated = true;
//   }

//   if (fmpStock.financialReportDates == undefined) {
//     fmpStock.financialReportDates = await getFinancialReportDates(fmpStock.symbol);
//     updated = true;
//   }

//   return updated;
// }

// Requests Income Statements from API for a given stock
async function getAnnualIncomeStatements(stock: string) {
  var annualIncomeStatements: Array<IncomeStatement> = [];
  var incomeStatements = await FMPService.getIncomeStatements(stock, true);
  Object.entries(incomeStatements as string).forEach((statement) => {
    var [key, value] = statement;
    var fmpIncomeStatement = JSON.parse(JSON.stringify(value)) as IncomeStatement;
    annualIncomeStatements.push(fmpIncomeStatement);
  });
  return annualIncomeStatements;
}

async function getAnnualBalanceSheets(stock: string) {
  var annualBalanceSheets: Array<BalanceSheet> = [];
  var balance = await FMPService.getBalanceSheets(stock, true);
  Object.entries(balance as string).forEach((statement) => {
    var [key, value] = statement;
    var fmpBalanceSheet = JSON.parse(JSON.stringify(value)) as BalanceSheet;
    annualBalanceSheets.push(fmpBalanceSheet);
  });
  return annualBalanceSheets;
}

async function getAnnualCashFlowStatements(stock: string) {
  var annualCashFlows: Array<CashFlows> = [];
  var cash = await FMPService.getCashFlows(stock, true);
  Object.entries(cash as string).forEach((statement) => {
    var [key, value] = statement;
    var fmpCashFlow = JSON.parse(JSON.stringify(value)) as CashFlows;
    annualCashFlows.push(fmpCashFlow);
  });
  return annualCashFlows;
}

async function getAnnualFinancialRatios(stock: string) {
  var annualFinancialRatios: Array<Ratios> = [];
  var ratios = await FMPService.getFinancialRatios(stock, true);
  Object.entries(ratios as string).forEach((statement) => {
    var [key, value] = statement;
    var fmpFinancialRatio = JSON.parse(JSON.stringify(value)) as Ratios;
    annualFinancialRatios.push(fmpFinancialRatio);
  });
  return annualFinancialRatios;
}

// async function getCompanyExecutives(stock: string) {
//   var executivesList: Array<FMPExecutive> = [];
//   var executives = await FMPService.getCompanyExecutives(stock);
//   Object.entries(executives as string).forEach((executive) => {
//     var [key, value] = executive;
//     var fmpExecutive = JSON.parse(JSON.stringify(value)) as FMPExecutive;
//     executivesList.push(fmpExecutive);
//   });
//   return executivesList;
// }

// async function getDailyCloses(stock: string, reportDates: any) {
//   var dailyCloses: Array<FMPDailyClose> = [];
//   var closes = await FMPService.getDailyHistoricalDataLast5Years(stock, reportDates);
//   Object.entries(closes as string).forEach((response) => {
//     var [key, value] = response;
//     var dailyHistoricalData = JSON.parse(JSON.stringify(value).replace(stock, ''));
//     Object.entries(dailyHistoricalData as string).forEach((day) => {
//       var [key, value] = day;
//       var fmpDailyClose = JSON.parse(JSON.stringify(value).replace(stock, '')) as FMPDailyClose;
//       dailyCloses.push(fmpDailyClose);
//     });
//   });
//   return dailyCloses;
// }

// // Request Competitor List from API of a given stock
// async function getCompanyPeerList(stock: string) {
//   var companyPeersList: Array<string> = [];
//   var peers = (await FMPService.getCompanyPeers(stock)) as any;
//   if (JSON.stringify(peers) != '[]') {
//     Object.entries(peers[0].peersList as any).forEach((peer) => {
//       var [key, value] = peer;
//       companyPeersList.push(value as string);
//     });
//   }
//   return companyPeersList;
// }

// Requests Press Releases from API for a given stock and stores reports as txt file
// async function getPressReleases(symbol: string) {
//   console.log('Downloading Press Releases for ' + symbol + '...');
//   var pressReleases: Array<FMPPressRelease> = [];
//   var pressReleasesData = await FMPService.getPressReleases(symbol);
//   for (const pressRelease of Object.entries(pressReleasesData as string)) {
//     var [key, value] = pressRelease;
//     var fmpEarningsCallTranscript = JSON.parse(JSON.stringify(value)) as FMPPressRelease;
//     pressReleases.push(fmpEarningsCallTranscript);
//   }

//   // Write Transcripts to File
//   var write = await FileReadWriteService.getInstance().savePressReleasesToTextFile(symbol, pressReleases);
// }

// Requests News Stories from API for a given stock, Pushes it through Open AI for format and write to a file
// async function getNewsStories(symbol: string) {
//   console.log('Downloading News Stories for ' + symbol + '...');
//   var newsStories: Array<FMPNewsStory> = [];
//   var newsStoriesData = await FMPService.getNewsStories(symbol);
//   for (const newsStory of Object.entries(newsStoriesData as string)) {
//     var [key, value] = newsStory;
//     var fmpNewsStory = JSON.parse(JSON.stringify(value)) as FMPNewsStory;

//     if (isFilteredNewsStory(fmpNewsStory)) {
//       // Scrape Website
//       await WebScraperService.getInstance()
//         .scrapeWebsite(fmpNewsStory.url)
//         .then(async (articleText) => {
//           console.log(key + ' length: ' + articleText.length);

//           fmpNewsStory.text = await OpenAIService.getInstance().extractNewsArticle(symbol, articleText);

//           var write = await FileReadWriteService.getInstance().saveNewsStoryToTextFile(fmpNewsStory);
//         });
//     }

//     console.log(key);
//     if (key === '200') {
//       break;
//     }
//   }
// }

// Requests list and links of financial report dates
// async function isNewFinancialDataAvailable(fmpStock: FMPStock) {
//   var newData = false;

//   var oldDates: Array<string> = [];
//   fmpStock.financialReportDates.forEach((reportDate) => {
//     var id = reportDate.date + '-' + reportDate.period;
//     oldDates.push(id);
//   });

//   var newDates: Array<string> = [];
//   var reportDates = await getFinancialReportDates(fmpStock.symbol);
//   reportDates.forEach((reportDate) => {
//     var id = reportDate.date + '-' + reportDate.period;
//     newDates.push(id);
//   });

//   newDates.forEach((reportDate) => {
//     if (!oldDates.includes(reportDate)) {
//       newData = true;
//     }
//   });

//   return newData;
// }

// export async function getEarningsCalanderDates() {
//   var earningsCalanderDates: Array<FMPEarningsDate> = [];
//   var dates = await FMPService.getEarningsCalander();
//   Object.entries(dates as string).forEach((report) => {
//     var [key, value] = report;
//     var earningsDate = JSON.parse(JSON.stringify(value)) as FMPEarningsDate;
//     earningsCalanderDates.push(earningsDate);
//   });
//   return earningsCalanderDates;
// }
