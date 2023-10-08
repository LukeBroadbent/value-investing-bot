const BASE_API_URL = 'https://financialmodelingprep.com/api/v3/';
const BASE_API_URL_V4 = 'https://financialmodelingprep.com/api/v4/';
const KEY = '644494d698d133a102ef46be3ec3b935';
const API_KEY = '&apikey=644494d698d133a102ef46be3ec3b935';
const API_KEY_FINAL = 'apikey=644494d698d133a102ef46be3ec3b935';

import axios from 'axios';

//This Service gathers financial data from financialmodelingprep API
export default class FinancialModelingPrepService {
  private static _instance: FinancialModelingPrepService = new FinancialModelingPrepService();

  constructor() {
    if (FinancialModelingPrepService._instance) {
      throw new Error('Error: Instantiation failed: Use DatabaseService.getInstance() instead of new.');
    }
    FinancialModelingPrepService._instance = this;
  }

  public static getInstance(): FinancialModelingPrepService {
    return FinancialModelingPrepService._instance;
  }

  async getFinancialModelingTickerList() {
    var url = BASE_API_URL + 'financial-statement-symbol-lists/' + '?' + API_KEY_FINAL;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getCompanyQuote(symbol: string) {
    var url = BASE_API_URL + 'quote/' + symbol + '?' + API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getCompanyProfile(symbol: string) {
    var url = BASE_API_URL + 'profile/' + symbol + '?' + API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getDailyHistoricalDataLast5Years(symbol: string, reportDates: any) {
    var fromDate = 'from=' + reportDates[4];
    var toDate = '&to=' + reportDates[0];

    var url =
      BASE_API_URL +
      'historical-price-full/' +
      symbol +
      '?' +
      fromDate +
      '&' +
      toDate +
      '&' +
      'serietype=line' +
      '&' +
      API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getIncomeStatements(symbol: string, isAnnual: boolean) {
    var url =
      BASE_API_URL +
      'income-statement/' +
      symbol +
      '?' +
      (isAnnual ? 'limit=120' : 'period=quarter&limit=400') +
      '&' +
      API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getBalanceSheets(symbol: string, isAnnual: boolean) {
    var url =
      BASE_API_URL +
      'balance-sheet-statement/' +
      symbol +
      '?' +
      (isAnnual ? 'limit=120' : 'period=quarter&limit=400') +
      '&' +
      API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getCashFlows(symbol: string, isAnnual: boolean) {
    var url =
      BASE_API_URL +
      'cash-flow-statement/' +
      symbol +
      '?' +
      (isAnnual ? 'limit=120' : 'period=quarter&limit=400') +
      '&' +
      API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getFinancialRatios(symbol: string, isAnnual: boolean) {
    var url =
      BASE_API_URL + 'ratios/' + symbol + '?' + (isAnnual ? 'limit=40' : 'period=quarter&limit=140') + '&' + API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getFinancialReportDates(symbol: string) {
    var url = BASE_API_URL_V4 + 'financial-reports-dates?symbol=' + symbol + API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getFinancialReport(url: string) {
    return new Promise(function (resolve, reject) {
      axios
        .get(url.replace('YOUR_API_KEY', KEY))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getCompanyExecutives(symbol: string) {
    var url = BASE_API_URL + 'key-executives/' + symbol + '?' + API_KEY_FINAL;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getCompanyPeers(symbol: string) {
    var url = BASE_API_URL_V4 + 'stock_peers?symbol=' + symbol + '&' + API_KEY_FINAL;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getEarningsCallDates(symbol: string) {
    var url = BASE_API_URL_V4 + 'earning_call_transcript?symbol=' + symbol + '&' + API_KEY_FINAL;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getEarningsCallTranscripts(symbol: string, qtr: string, year: string) {
    var url = BASE_API_URL + 'earning_call_transcript/' + symbol + '?quarter=' + qtr + '&year=' + year + API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getPressReleases(symbol: string) {
    var url = BASE_API_URL + 'press-releases/' + symbol + '?page=0' + API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getNewsStories(symbol: string) {
    var url = BASE_API_URL + 'stock_news?tickers=' + symbol + '&limit=200000?' + API_KEY;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getEarningsCalander() {
    var url = BASE_API_URL + 'earning_calendar?' + API_KEY_FINAL;
    return new Promise(function (resolve, reject) {
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
