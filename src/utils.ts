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

export function getKeyValuePairsFromFinancialData(json: JSON) {
  function traverseJSON(obj: any, result: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // If the value is an object, recursively traverse it
        traverseJSON(obj[key], result);
      } else {
        // If it's not an object, add the key-value pair to the result list
        result.push({ key, value: obj[key] });
      }
    }
  }
  const resultList: any[] = [];
  traverseJSON(json, resultList);
  return resultList;
}
