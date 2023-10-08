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

  var texts: string[] = []

  const callbacks = {
      processValue: (value:string) => { 
          if (value != null && value != undefined && value.length > 500) {
              texts.push(value)
          }
      }
  };
  
  const jt = require('');
  await jt.traverse(json, callbacks);

  return texts
}
