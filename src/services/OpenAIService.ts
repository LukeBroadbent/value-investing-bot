import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';

import { stdout as output } from 'process';
import { oneLine } from 'common-tags';
import path from 'path';
import { fileURLToPath } from 'url';

// Langchain Imports
import { LLMChain } from 'langchain/chains';
import { OpenAIChat } from 'langchain/llms/openai';
import { CallbackManager } from 'langchain/callbacks';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import { BufferWindowMemory } from 'langchain/memory';
import { ChainValues } from 'langchain/schema';
import { splitStringByCharacterLimitAndFullStop } from '../utils.js';

const callbackManager = CallbackManager.fromHandlers({
  // This function is called when the LLM generates a new token (i.e., a prediction for the next word)
  async handleLLMNewToken(token: string) {
    // Write the token to the output stream (i.e., the console)
    output.write(token);
  },
});

const llm = new OpenAIChat({
  streaming: true,
  modelName: 'gpt-3.5-turbo-16k',
});

const currentModulePath = fileURLToPath(import.meta.url);
const projectRootDir = path.resolve(path.dirname(currentModulePath), '..');

// Get the prompt template
const systemPromptTemplate = fs.readFileSync(path.join(projectRootDir, '../src/summaryPrompt.txt'), 'utf8');

const systemPrompt = SystemMessagePromptTemplate.fromTemplate(oneLine`
  ${systemPromptTemplate}
`);

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  systemPrompt,
  HumanMessagePromptTemplate.fromTemplate('QUESTION: """{input}"""'),
]);

const chain = new LLMChain({
  prompt: chatPrompt,
  llm,
});

const maxCharactors = 12000;

export default class OpenAIService {
  private static _instance: OpenAIService = new OpenAIService();

  constructor() {
    if (OpenAIService._instance) {
      throw new Error('Error: Instantiation failed: Use DatabaseService.getInstance() instead of new.');
    }
    OpenAIService._instance = this;
  }

  public static getInstance(): OpenAIService {
    return OpenAIService._instance;
  }

  async summarizeTextViaOpenAI(text: string) {
    var maxRetry = 3;
    for (var i = 0; i < maxRetry; i++) {
      try {
        return await chain.call({
          input: 'Summarize the following text: ',
          text: text,
        });
      } catch (error) {
        this.delay(5000);
      }
    }
    return undefined;
  }

  async extractTextViaOpenAI(symbol: string, text: string) {
    var maxRetry = 3;
    for (var i = 0; i < maxRetry; i++) {
      try {
        return await chain.call({
          input: 'Extract the ' + symbol + ' News Article from the following text: ',
          text: text,
        });
      } catch (error) {
        this.delay(5000);
      }
    }
    return undefined;
  }

  delay = (delayInms: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

  async summarizeTextList(textList: string[]) {
    var summaries: string[] = [];

    for (var i = 0; i < textList.length; i++) {
      if (textList[i].length > maxCharactors) {
        var splitSummaries: string[] = [];
        var stringChunks = splitStringByCharacterLimitAndFullStop(textList[i], maxCharactors);

        for (var x = 0; x < stringChunks.length; x++) {
          await this.summarizeTextViaOpenAI(stringChunks[x]).then((response) => {
            splitSummaries.push(response?.text);
          });
        }

        var combinedSummaries = '';
        splitSummaries.forEach((split) => {
          combinedSummaries = combinedSummaries + split + '\n';
        });

        await this.summarizeTextViaOpenAI(combinedSummaries).then((response) => {
          summaries.push(response?.text);
        });
      } else {
        await this.summarizeTextViaOpenAI(textList[i]).then((response) => {
          summaries.push(response?.text);
        });
      }
    }

    return summaries;
  }

  async summarizeText(text: string) {
    var summary = '';
    if (text.length > maxCharactors) {
      var splitSummaries: string[] = [];
      var stringChunks = splitStringByCharacterLimitAndFullStop(text, maxCharactors);

      for (var x = 0; x < stringChunks.length; x++) {
        await this.summarizeTextViaOpenAI(stringChunks[x]).then((response) => {
          splitSummaries.push(response?.text);
        });
      }

      var combinedSummaries = '';
      splitSummaries.forEach((split) => {
        combinedSummaries = combinedSummaries + split + '\n';
      });

      await this.summarizeTextViaOpenAI(combinedSummaries).then((response) => {
        summary = response?.text;
      });
    } else {
      await this.summarizeTextViaOpenAI(text).then((response) => {
        summary = response?.text;
      });
    }

    return summary;
  }

  async extractNewsArticle(symbol: string, newsStoryText: string) {
    var finalArticle = '';
    var summarizedText = '';
    // await this.summarizeText(newsStoryText).then((summary) => {
    //   summarizedText = summary;
    // });

    //var prompt = "The following text contains a news article about " + symbol + ". Extract the entire news story as I want to run sentiment analysis on it once extracted: "
    await this.extractTextViaOpenAI(symbol, newsStoryText).then((response) => {
      finalArticle = response?.text;
    });

    return finalArticle;
  }
}
