import chalk from 'chalk';
import createCommand from './command.js';
import { getNewsStories } from '../../helpers/FinancialModelingPrepHelper.js';
import FileReadWriteService, { doesFileExistInDirectory } from '../../services/FileReadWriteService.js';
import { Directory, TimeFrame, convertToWindowsFilename, isFilteredNewsStory } from '../../utils.js';
import NewsStory from '../financialModelingPrep/NewsStory.js';
import WebScraperService from '../../services/WebScraperService.js';
import OpenAIService from '../../services/OpenAIService.js';
import NewsMemoryService from '../../services/NewsMemoryService.js';

const newsStoriesCommand = createCommand(
  'news-stories',
  ['news', 'stories'],
  `Downloads specified company's lastest news storys and saves them to long term memory.\n
   Usage: /news-stories aapl\n`,

  async (args: string[], output: NodeJS.WriteStream) => {
    if (Array.isArray(args) && !args.length) {
      output.write(chalk.red('Invalid number of arguments. Usage: /news-stories aapl\n'));
      return;
    }

    // This is where we make the call here to download from
    var symbol = args[0].toUpperCase();

    // Sets Timeframe for News Article Downloads
    var timeFrame = TimeFrame.Week;
    var newsStories: Array<NewsStory> = await getNewsStories(symbol);

    console.log('Summarizing News Stories for ' + symbol + '...');
    for (const story of newsStories) {
      const fileName = symbol.toLowerCase() + '-' + convertToWindowsFilename(story.publishedDate) + '.txt';

      if (isFilteredNewsStory(story, timeFrame) && !doesFileExistInDirectory(symbol, fileName, Directory.News)) {
        await WebScraperService.getInstance()
          .scrapeWebsite(story.url)
          .then(async (articleText) => {
            await OpenAIService.getInstance()
              .extractNewsArticle(symbol, articleText)
              .then((storyText) => {
                story.text = storyText;
              });

            var write = await FileReadWriteService.getInstance().saveNewsStoryToTextFile(story);
          });
      }
    }

    // Embed and Write to Chroma DB
    console.log('Embedding News Stories for ' + symbol + '...');
    //await NewsMemoryService.getInstance().addNewsStoriesToMemory(symbol)
  }
);

export default newsStoriesCommand;
