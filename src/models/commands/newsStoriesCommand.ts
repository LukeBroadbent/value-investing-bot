import chalk from 'chalk';
import createCommand from './command.js';
import { getNewsStories } from '../../helpers/FinancialModelingPrepHelper.js';
import FileReadWriteService from '../../services/FileReadWriteService.js';
import { TimeFrame, isFilteredNewsStory } from '../../utils.js';
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
    var timeFrame = TimeFrame.Week
    var newsStories: Array<NewsStory> = await getNewsStories(symbol);

    for (const story of newsStories) {
      if (isFilteredNewsStory(story, timeFrame)) {
        await WebScraperService.getInstance()
          .scrapeWebsite(story.url)
          .then(async (articleText) => {
            await OpenAIService.getInstance().extractNewsArticle(symbol, articleText).then(storyText => {
              story.text = storyText
              console.log("Extracted Length: " + storyText.length)
              console.log(storyText + "\n\n\n")
            })

          var write = await FileReadWriteService.getInstance().saveNewsStoryToTextFile(story);

          });
      }
    }

    // Embed and Write to Chroma DB
    await NewsMemoryService.getInstance().addNewsStoriesToMemory(symbol)
  }
);

export default newsStoriesCommand;
