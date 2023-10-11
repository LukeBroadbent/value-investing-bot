import BalanceSheet from '../models/financialModelingPrep/BalanceSheet.js';
import CashFlows from '../models/financialModelingPrep/CashFlow.js';
import EarningsCallTranscript from '../models/financialModelingPrep/EarningsCallTranscript.js';
import FinancialReport from '../models/financialModelingPrep/FinancialReport.js';
import FinancialReportDate from '../models/financialModelingPrep/FinancialReportDate.js';
import FinancialData from '../models/financialModelingPrep/FinancialData.js';
import IncomeStatement from '../models/financialModelingPrep/IncomeStatement.js';
import NewsStory from '../models/financialModelingPrep/NewsStory.js';
import Ratios from '../models/financialModelingPrep/Ratios.js';
import FinancialModelingPrepService from '../services/FinancialModelingPrepService.js';
import WebScraperService from '../services/WebScraperService.js';
import { isFilteredNewsStory } from '../utils.js';
import PressRelease from '../models/financialModelingPrep/PressRelease.js';

const FMPService = FinancialModelingPrepService.getInstance();

export async function getFinancialData(symbol: string) {
  console.log('Downloading Financial Data for ' + symbol + '...');
  var financialData: Array<FinancialData> = [];

  var annualIncomeStatements = await getAnnualIncomeStatements(symbol);
  var annualBalanceSheets = await getAnnualBalanceSheets(symbol);
  var annualCashFlows = await getAnnualCashFlowStatements(symbol);
  var annualFinancialRatios = await getAnnualFinancialRatios(symbol);
  var min = Math.min(annualBalanceSheets.length, annualCashFlows.length, annualIncomeStatements.length);

  for (var i = 0; i < min; i++) {
    var year: FinancialData = new FinancialData();
    year.financial_year = annualIncomeStatements[i].calendarYear;
    year.income_statement = annualIncomeStatements[i];
    year.balance_sheet = annualBalanceSheets[i];
    year.cash_flow = annualCashFlows[i];
    year.ratios = annualFinancialRatios[i];
    financialData.push(year);
  }

  return financialData;
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
    var earningsCallTranscript = JSON.parse(JSON.stringify(transcript).slice(1, -1)) as EarningsCallTranscript;
    transcripts.push(earningsCallTranscript);
  }

  return transcripts;
}

// Requests Financial Reports from API for a given stock and stores reports as txt files
export async function getFinancialReports(symbol: string) {
  console.log('Downloading Financial Reports for ' + symbol + '...');
  var financialReportDates: Array<FinancialReportDate> = await getFinancialReportDates(symbol);

  // Download Report JSON
  
  var financialReports: Array<FinancialReport> = [];

  for (const date of financialReportDates) {
    // Annual Reports
    if (date.period === 'FY' && date.linkJson != null) {
      console.log('\t~ ' + date.date);
      var reportData = await FMPService.getFinancialReport(date.linkJson);
      var finanicalReport = new FinancialReport(date.symbol, date.period, date.date, reportData as JSON);
      financialReports.push(finanicalReport);
    }

    // Quartetly Reports
    if (date.period.includes('Q') && date.linkJson != null) {
      console.log('\t~ ' + date.date + ' - ' + date.period);
      var reportData = await FMPService.getFinancialReport(date.linkJson);
      var finanicalReport = new FinancialReport(date.symbol, date.period, date.date, reportData as JSON);
      financialReports.push(finanicalReport);
    }
  }
  return financialReports;
}

async function getFinancialReportDates(symbol: string) {
  var financialReportDates: Array<FinancialReportDate> = [];
  var dates = await FMPService.getFinancialReportDates(symbol);

  Object.entries(dates as string).forEach((report) => {
    var [key, value] = report;
    var financialReportDate = JSON.parse(JSON.stringify(value)) as FinancialReportDate;
    financialReportDates.push(financialReportDate);
  });

  return financialReportDates;
}

// Requests News Stories from API for a given stock, Pushes it through Open AI for format and write to a file
export async function getNewsStories(symbol: string) {
  console.log('Downloading News Stories for ' + symbol + '...');
  var newsStories: Array<NewsStory> = [];
  var newsStoriesData = await FMPService.getNewsStories(symbol);
  for (const newsStory of Object.entries(newsStoriesData as string)) {
    var [key, value] = newsStory;
    var story = JSON.parse(JSON.stringify(value)) as NewsStory;
    newsStories.push(story);

    // Below is for testing. to only grab 10 articles
    if (key === '10') {
      break;
    }
  }
  return newsStories;
}

// Requests Press Releases from API for a given stock and stores reports as txt file
export async function getPressReleases(symbol: string) {
	console.log("Downloading Press Releases for " + symbol + "...")
	var pressReleases: Array<PressRelease> = []
	var pressReleasesData = await FMPService.getPressReleases(symbol)
	for (const pressRelease of Object.entries(pressReleasesData as string)) {
		var [key, value] = pressRelease;
		var fmpEarningsCallTranscript = JSON.parse(JSON.stringify(value)) as PressRelease
		pressReleases.push(fmpEarningsCallTranscript)
  }
  return pressReleases
}

// Requests Income Statements from API for a given stock
async function getAnnualIncomeStatements(stock: string) {
  var annualIncomeStatements: Array<IncomeStatement> = [];
  var incomeStatements = await FMPService.getIncomeStatements(stock, true);
  Object.entries(incomeStatements as string).forEach((statement) => {
    var [key, value] = statement;
    var incomeStatement = JSON.parse(JSON.stringify(value)) as IncomeStatement;
    annualIncomeStatements.push(incomeStatement);
  });
  return annualIncomeStatements;
}

async function getAnnualBalanceSheets(stock: string) {
  var annualBalanceSheets: Array<BalanceSheet> = [];
  var balance = await FMPService.getBalanceSheets(stock, true);
  Object.entries(balance as string).forEach((statement) => {
    var [key, value] = statement;
    var balanceSheet = JSON.parse(JSON.stringify(value)) as BalanceSheet;
    annualBalanceSheets.push(balanceSheet);
  });
  return annualBalanceSheets;
}

async function getAnnualCashFlowStatements(stock: string) {
  var annualCashFlows: Array<CashFlows> = [];
  var cash = await FMPService.getCashFlows(stock, true);
  Object.entries(cash as string).forEach((statement) => {
    var [key, value] = statement;
    var cashFlow = JSON.parse(JSON.stringify(value)) as CashFlows;
    annualCashFlows.push(cashFlow);
  });
  return annualCashFlows;
}

async function getAnnualFinancialRatios(stock: string) {
  var annualFinancialRatios: Array<Ratios> = [];
  var ratios = await FMPService.getFinancialRatios(stock, true);
  Object.entries(ratios as string).forEach((statement) => {
    var [key, value] = statement;
    var financialRatio = JSON.parse(JSON.stringify(value)) as Ratios;
    annualFinancialRatios.push(financialRatio);
  });
  return annualFinancialRatios;
}
