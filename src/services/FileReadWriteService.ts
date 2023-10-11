import fs from 'node:fs';
import { jsonToPlainText } from 'json-to-plain-text';
import EarningsCallTranscript from '../models/financialModelingPrep/EarningsCallTranscript.js';
import { convertToWindowsFilename } from '../utils.js';
import FinancialData from '../models/financialModelingPrep/FinancialData.js';
import NewsStory from '../models/financialModelingPrep/NewsStory.js';
import PressRelease from '../models/financialModelingPrep/PressRelease.js';

const options = {
  color: false, // Whether to apply colors to the output or not
  spacing: false, // Whether to include spacing before colons or not
  squareBracketsForArray: false, // Whether to use square brackets for arrays or not
  doubleQuotesForKeys: false, // Whether to use double quotes for object keys or not
  doubleQuotesForValues: false, // Whether to use double quotes for string values or not
};
const FILEPATH = process.cwd();
const FILEPATH_COMPANY = FILEPATH + '\\company\\';
const FILEPATH_REPORTS = '\\reports\\';
const FILEPATH_TRANSCRIPTS = '\\transcripts\\';
const FILEPATH_FINANCIALS = '\\financials\\';
const FILEPATH_NEWS = '\\news\\';
const FILEPATH_PRESS = '\\press\\'
const FILEPATH_BUSINESS_REPORT = FILEPATH + '\\business\\';

export default class FileReadWriteService {
  private static _instance: FileReadWriteService = new FileReadWriteService();

  constructor() {
    if (FileReadWriteService._instance) {
      throw new Error('Error: Instantiation failed: Use FileReadWriteService.getInstance() instead of new.');
    }
    FileReadWriteService._instance = this;
  }

  public static getInstance(): FileReadWriteService {
    return FileReadWriteService._instance;
  }

  public async saveFinancialReport(symbol: string, fileName: string, data: any) {

    var text = '';
    for (var i = 0; i < data.length; i++) {
      text = text + data[i];
      if (i != data.length - 1) {
        text = text + '\n';
      }
    }

    return new Promise(function (resolve, reject) {
      if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + '\\')) {
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + fileName + '.txt', text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      } else {
        fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + '\\', { recursive: true });
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + '\\' + fileName + '.txt', text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      }
    });
  }

  public async saveFinancialData(symbol: string, data: FinancialData) {
    const fileName = symbol.toLowerCase() + '-financials-' + data.financial_year + '.json';

    return new Promise(function (resolve, reject) {
      if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_FINANCIALS + '\\')) {
        fs.writeFile(
          FILEPATH_COMPANY + symbol + FILEPATH_FINANCIALS + fileName,
          JSON.stringify(data, null, 4),
          (err) => {
            if (err) {
              console.log('error', err);
            } else {
              resolve(true);
            }
          }
        );
      } else {
        fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_FINANCIALS + '\\', { recursive: true });
        fs.writeFile(
          FILEPATH_COMPANY + symbol + FILEPATH_FINANCIALS + '\\' + fileName,
          JSON.stringify(data, null, 4),
          (err) => {
            if (err) {
              console.log('error', err);
            } else {
              resolve(true);
            }
          }
        );
      }
    });
  }

  public async saveEarningsCallTranscriptsToTextFile(symbol: string, transcript: EarningsCallTranscript) {
    const fileName = symbol.toLowerCase() + '-q' + transcript.quarter + '-' + transcript.year + '-transcript.txt';
    //const text = jsonToPlainText(transcript.content, options);
    const text = transcript.content;

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

  public async savePressReleasesToTextFile(symbol: string, pressRelease: PressRelease) {

    const fileName = symbol.toLowerCase() + "-" + pressRelease.date.split(" ")[0] + '-release.txt';
    const text = pressRelease.date + "\n" + pressRelease.title + "\n" + pressRelease.text;

    return new Promise(function (resolve, reject) {
      if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_PRESS + '\\')) {
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_PRESS + fileName, text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      } else {
        fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_PRESS + '\\', { recursive: true });
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_PRESS + '\\' + fileName, text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      }
    });
  }

  public async saveNewsStoryToTextFile(newsStory: NewsStory) {
    const symbol = newsStory.symbol;
    const text = newsStory.text;
    const fileName = symbol.toLowerCase() + '-' + convertToWindowsFilename(newsStory.publishedDate) + '.txt';

    return new Promise(function (resolve, reject) {
      if (fs.existsSync(FILEPATH_COMPANY + symbol + FILEPATH_NEWS + '\\')) {
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_NEWS + fileName, text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      } else {
        fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_NEWS + '\\', { recursive: true });
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_NEWS + '\\' + fileName, text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      }
    });
  }
}
