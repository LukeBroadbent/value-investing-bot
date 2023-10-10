export default function sanitizeInput(input: string): string {
  return input.trim().replaceAll('\n', ' ');
}

export function convertToWindowsFilename(dateTimeString: string) {
  // Replace invalid filename characters with underscores
  const sanitizedFilename = dateTimeString.replace(/[/\\?%*:|"<>]/g, '_');

  // Replace spaces with underscores
  const finalFilename = sanitizedFilename.replace(/ /g, '_');

  return finalFilename;
}

export function splitStringByCharacterLimitAndFullStop(inputString: string, characterLimit: number) {
  const substrings: string[] = [];
  let currentIndex = 0;

  while (currentIndex < inputString.length) {
    let endIndex = currentIndex + characterLimit;

    // Check if the endIndex is within the string length
    if (endIndex >= inputString.length) {
      endIndex = inputString.length;
    } else {
      // Find the nearest full stop before the endIndex
      const lastFullStopIndex = inputString.lastIndexOf('.', endIndex);

      if (lastFullStopIndex !== -1) {
        endIndex = lastFullStopIndex + 1; // Include the full stop
      }
    }

    // Extract the substring and add it to the result array
    substrings.push(inputString.slice(currentIndex, endIndex));

    // Update the currentIndex
    currentIndex = endIndex;
  }

  return substrings;
}

export async function getImportantExcertsFromFinancialReport(json: JSON) {
  const excerts: string[] = [];

  function traverse(obj: any) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string' && value.length > 500) {
          excerts.push(value);
        }
        if (typeof value === 'object' && value !== null) {
          traverse(value); // Recursively traverse nested objects
        }
      }
    }
  }

  traverse(json);
  return excerts;
}

export function getNumericalKeyValuePairsFromFinancialData(json: JSON) {
  // Ignore String here as we don't care about them, we only care about the numbers
  function traverseJSON(obj: any, result: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // If the value is an object, recursively traverse it
        traverseJSON(obj[key], result);
      } else {
        // If it's not an object, add the key-value pair to the result list
        // We only accepts numbers
        if (typeof obj[key] === 'number') {
          result.push({ key, value: obj[key] });
        }
      }
    }
  }
  const resultList: any[] = [];
  traverseJSON(json, resultList);
  return resultList;
}

import NewsStory from './models/financialModelingPrep/NewsStory.js';
// Update this function to pull stories for different durations. Last Week, Last fortnight, last month, last qtr, last 6 months, last year, last 2 years etc
export function isFilteredNewsStory(newsStory: NewsStory, timeframe: TimeFrame) {
  var siteFilters = ['Seeking Alpha', 'Zacks Investment Research', 'InvestorPlace', 'Investopedia', 'Reuters'];
  if (siteFilters.includes(newsStory.site) && isStoryWithinTimeframe(newsStory.publishedDate, timeframe)) {
    return true;
  }
  return false;
}

function isStoryWithinTimeframe(storyDate: string, timeframe: TimeFrame) {
  const date = new Date(storyDate);
  const currentDate = new Date();

  switch(timeframe) {

    case TimeFrame.Week:
      const weektAgo = new Date();
      weektAgo.setDate(currentDate.getDate() - 7);
      if (date >= weektAgo && date <= currentDate) {
        return true;
      }
      return false;

    case TimeFrame.Fortnight:
      const fortnightAgo = new Date();
      fortnightAgo.setDate(currentDate.getDate() - 14);
      if (date >= fortnightAgo && date <= currentDate) {
        return true;
      }
      return false;

    case TimeFrame.Month:
      const monthAgo = new Date();
      monthAgo.setMonth(currentDate.getMonth() - 1);
      if (date >= monthAgo && date <= currentDate) {
        return true;
      }
      return false;

    case TimeFrame.Quarter:
      const quarterAgo = new Date();
      quarterAgo.setMonth(currentDate.getMonth() - 3);
      if (date >= quarterAgo && date <= currentDate) {
        return true;
      }
      return false;

    case TimeFrame.Half:
      const halfAgo = new Date();
      halfAgo.setMonth(currentDate.getMonth() - 6);
      if (date >= halfAgo && date <= currentDate) {
        return true;
      }
      return false;

    case TimeFrame.Year:
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      if (date >= oneYearAgo && date <= currentDate) {
        return true;
      }
      return false;

    case TimeFrame.All:
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);
      if (date >= twoYearsAgo && date <= currentDate) {
        return true;
      }
      return false;
  }
}

export enum TimeFrame {
	Week,
	Fortnight,
	Month,
	Quarter,
	Half,
	Year,
  All
}
