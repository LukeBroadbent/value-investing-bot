import fs from 'node:fs';
import { jsonToPlainText } from 'json-to-plain-text';
import EarningsCallTranscript from '../models/financialModelingPrep/EarningsCallTranscript.js';
import { convertToWindowsFilename } from '../utils.js';
import FinancialData from '../models/financialModelingPrep/FinancialData.js';

const options = {
  color: false, // Whether to apply colors to the output or not
  spacing: false, // Whether to include spacing before colons or not
  squareBracketsForArray: false, // Whether to use square brackets for arrays or not
  doubleQuotesForKeys: false, // Whether to use double quotes for object keys or not
  doubleQuotesForValues: false, // Whether to use double quotes for string values or not
};
const FILEPATH = process.cwd();
const FILEPATH_STOCKS = FILEPATH + '\\stocks\\';
const FILEPATH_TICKERS = FILEPATH + '\\tickers.json';
const FILEPATH_COMPANY = FILEPATH + '\\company\\';
const FILEPATH_REPORTS = '\\reports\\';
const FILEPATH_TRANSCRIPTS = '\\transcripts\\';
const FILEPATH_FINANCIALS = '\\financials\\';
const FILEPATH_NEWS = '\\news\\';
const FILEPATH_BUSINESS_REPORT = FILEPATH + '\\business\\';

export default class FileReadWriteService {
  private static _instance: FileReadWriteService = new FileReadWriteService();

  constructor() {
    if (FileReadWriteService._instance) {
      throw new Error('Error: Instantiation failed: Use FMPStockToJSONFileService.getInstance() instead of new.');
    }
    FileReadWriteService._instance = this;
  }

  public static getInstance(): FileReadWriteService {
    return FileReadWriteService._instance;
  }

  // Ticker File
  // public hasStockListBeenRetrieved() {
  //   if(fs.existsSync(FILEPATH_TICKERS)) {
  //     return true
  //   }
  //   return false
  // }

  // public async saveTickerDataToFile(data: string) {
  //   return new Promise(function (resolve, reject) {
  //       fs.writeFile(FILEPATH_TICKERS, data, function(err, result) {
  //         if(err) { console.log('error', err); } else { resolve(true) }
  //       });
  //   })
  // }

  // public readTickerDataFromFile() {
  //   var jsonString = fs.readFileSync(FILEPATH_TICKERS, 'utf-8');
  //   return jsonString
  // }

  // // Stock Data File
  // public hasStockDataBeenRetrieved(symbol: string) {
  //   if (fs.existsSync(FILEPATH_STOCKS + symbol + ".json")) {
  //     return true
  //   }
  //   return false
  // }

  // public async saveStockDataToFile(symbol: string, data: string) {
  //   return new Promise(function (resolve, reject) {
  //     if (fs.existsSync(FILEPATH_STOCKS)) {
  //       fs.writeFile(FILEPATH_STOCKS + symbol + ".json", data, function(err, result) {
  //         if(err) { console.log('error', err); } else { resolve(true) }
  //       });
  //     } else {
  //       fs.mkdirSync(FILEPATH_STOCKS, { recursive: true });
  //       fs.writeFile(FILEPATH_STOCKS + symbol + ".json", data, function(err, result) {
  //             if(err) { console.log('error', err); } else { resolve(true) }
  //         });
  //     }
  //   })
  // }

  // public readStockDataFromFile(symbol: string) {
  //     var jsonString = fs.readFileSync(FILEPATH_STOCKS + symbol + ".json", 'utf-8');
  //     return jsonString
  // }

  // // Financial Report Files
  // public hasFinancialReportsBeenDownloaded(symbol: string) {
  //   if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + "\\")) {
  //     return true
  //   }
  //   return false
  // }

  // public async saveReportDataToJSONFile(symbol: string, fileName: string, data: any) {

  //   // Convert JSON to Plaintext
  //   const text = jsonToPlainText(data, options);

  //   return new Promise(function (resolve, reject) {
  //     if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + "\\")) {
  //       fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + fileName + ".json", text, function(err, result) {
  //         if(err) { console.log('error', err); } else { resolve(true) }
  //       });
  //     } else {
  //       fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + "\\", { recursive: true });
  //       fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + "\\" + fileName + ".json", text, function(err, result) {
  //         if(err) { console.log('error', err); } else { resolve(true) }
  //       });
  //     }
  //   })

  // }

  public async saveFinancialReport(symbol: string, fileName: string, data: any) {
    // Convert JSON to Plaintext

    // Creates Format for Report Output
    var text = ""
    for (var i = 0; i < data.length; i++) {
      text = text + data[i]
      if (i != data.length -1) {
        text = text + "\n"
      }
    }

    return new Promise(function (resolve, reject) {
      if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + "\\")) {
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + fileName + ".txt", text, (err) => {
            if (err) {
              console.log('error', err);
            } else {
              resolve(true);
            }
          });
      } else {
        fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + "\\", { recursive: true });
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + "\\" + fileName + ".txt", text, (err) => {
            if (err) {
              console.log('error', err);
            } else {
              resolve(true);
            }
          });
      }
    })
  }

  public async saveFinancialData(symbol: string, data: FinancialData) {
    const fileName = symbol.toLowerCase() + '-financials-' + data.financial_year + '.json'

    return new Promise(function (resolve, reject) {
      if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_FINANCIALS + '\\')) {
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_FINANCIALS + fileName, JSON.stringify(data), (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      } else {
        fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_FINANCIALS + '\\', { recursive: true });
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_FINANCIALS + '\\' + fileName, JSON.stringify(data), (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      }
    });
  }

  public async saveEarningsCallTranscriptsToTextFile(symbol: string, transcript: EarningsCallTranscript) {
    const fileName = symbol.toLowerCase() + '-q' + transcript.quarter + '-' + transcript.year + '-transcript.txt';
    const text = jsonToPlainText(transcript.content, options);

    return new Promise(function (resolve, reject) {
      if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_TRANSCRIPTS + '\\')) {
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_TRANSCRIPTS + fileName, text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      } else {
        fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_TRANSCRIPTS + '\\', { recursive: true });
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_TRANSCRIPTS + '\\' + fileName, text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      }
    });
  }

  // public async savePressReleasesToTextFile(symbol: string, data: any) {

  // 	const fileName = symbol + "-PressReleases.txt"
  // 	const text = jsonToPlainText(data, options)

  // 	return new Promise(function (resolve, reject) {
  // 		if (fs.existsSync(FILEPATH_COMPANY + symbol + "\\")) {
  // 			fs.writeFile(FILEPATH_COMPANY + symbol + "\\" + fileName, text, function(err, result) {
  // 				if(err) { console.log('error', err); } else { resolve(true) }
  // 			});
  // 		} else {
  // 			fs.mkdirSync(FILEPATH_COMPANY + symbol + "\\", { recursive: true });
  // 			fs.writeFile(FILEPATH_COMPANY + symbol + "\\" + fileName, text, function(err, result) {
  // 				if(err) { console.log('error', err); } else { resolve(true) }
  // 			});
  // 		}
  //     })

  // }

  //   public async saveNewsStoryToTextFile(newsStory: FMPNewsStory) {

  //     const symbol = newsStory.symbol
  //     const text = newsStory.text
  //     const fileName = symbol.toLowerCase() + "-" + convertToWindowsFilename(newsStory.publishedDate) + ".txt"

  //     return new Promise(function (resolve, reject) {
  //       if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_NEWS + "\\")) {
  //         fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_NEWS + fileName, text, function(err, result) {
  //           if(err) { console.log('error', err); } else { resolve(true) }
  //         });
  //       } else {
  //         fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_NEWS + "\\", { recursive: true });
  //         fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_NEWS + "\\" + fileName, text, function(err, result) {
  //           if(err) { console.log('error', err); } else { resolve(true) }
  //         });
  //       }
  //         })

  // 	}

  //   public async saveBusinessOverviewToTextFile(fileName: string, data: any) {

  //     // Convert JSON to Plaintext
  //     const text = jsonToPlainText(data, options);

  //     return new Promise(function (resolve, reject) {
  //   if (fs.existsSync(FILEPATH_BUSINESS_REPORT + "\\")) {
  //     fs.writeFile(FILEPATH_BUSINESS_REPORT + fileName + ".txt", text, function(err, result) {
  //       if(err) { console.log('error', err); } else { resolve(true) }
  //     });
  //   } else {
  //     fs.mkdirSync(FILEPATH_BUSINESS_REPORT + "\\", { recursive: true });
  //     fs.writeFile(FILEPATH_BUSINESS_REPORT + "\\" + fileName + ".txt", text, function(err, result) {
  //       if(err) { console.log('error', err); } else { resolve(true) }
  //     });
  //   }
  //     })
  // }
}
