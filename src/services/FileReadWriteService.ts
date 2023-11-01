import fs from 'node:fs';
import path from 'node:path';

import EarningsCallTranscript from '../models/financialModelingPrep/EarningsCallTranscript.js';
import { Directory, convertToWindowsFilename } from '../utils.js';
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
const FILEPATH_PRESS = '\\press\\';
const FILEPATH_PROMPTS = FILEPATH + '\\prompts\\';

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
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + fileName, text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      } else {
        fs.mkdirSync(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + '\\', { recursive: true });
        fs.writeFile(FILEPATH_COMPANY + symbol + FILEPATH_REPORTS + '\\' + fileName, text, (err) => {
          if (err) {
            console.log('error', err);
          } else {
            resolve(true);
          }
        });
      }
    });
  }

  public async saveFinancialData(symbol: string, fileName: string, data: FinancialData) {
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

  public async saveEarningsCallTranscriptsToTextFile(
    symbol: string,
    fileName: string,
    transcript: EarningsCallTranscript
  ) {
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

  public async savePressReleasesToTextFile(symbol: string, fileName: string, pressRelease: PressRelease) {
    const text = pressRelease.date + '\n' + pressRelease.title + '\n' + pressRelease.text;

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

  public readPromptsFromFile(fileName: string) {
    var jsonString = fs.readFileSync(FILEPATH_PROMPTS + fileName, 'utf-8');
    return jsonString;
  }
}

export function doesFileExistInDirectory(symbol: string, filename: string, directory: Directory) {
  var directoryPath = FILEPATH_COMPANY + symbol;
  switch (directory) {
    case Directory.Reports:
      directoryPath += FILEPATH_REPORTS;
      break;
    case Directory.Financials:
      directoryPath += FILEPATH_FINANCIALS;
      break;
    case Directory.News:
      directoryPath += FILEPATH_NEWS;
      break;
    case Directory.Press:
      directoryPath += FILEPATH_PRESS;
      break;
    case Directory.Transcripts:
      directoryPath += FILEPATH_TRANSCRIPTS;
      break;
  }

  try {
    const files = fs.readdirSync(directoryPath);

    // Filter out files from the list and exclude subdirectories
    const fileNames = files.filter((file) => {
      const filePath = path.join(directoryPath, file);
      return fs.statSync(filePath).isFile();
    });

    return fileNames.includes(filename);
  } catch (err) {
    console.error('Error reading directory:', err);
    return false; // Return false to indicate an error
  }
}
