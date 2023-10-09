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
  callbackManager,
  modelName: process.env.MODEL || 'gpt-3.5-turbo',
});

const currentModulePath = fileURLToPath(import.meta.url);
const projectRootDir = path.resolve(path.dirname(currentModulePath), '..');

// Get the prompt template
const systemPromptTemplate = fs.readFileSync(path.join(projectRootDir, '../src/prompt.txt'), 'utf8');

const systemPrompt = SystemMessagePromptTemplate.fromTemplate(oneLine`
  ${systemPromptTemplate}
`);

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  systemPrompt,
  HumanMessagePromptTemplate.fromTemplate('QUESTION: """{input}"""'),
]);

const bufferWindowMemory = new BufferWindowMemory({
  returnMessages: false,
  memoryKey: 'immediate_history',
  inputKey: 'input',
  k: 2,
});

const chain = new LLMChain({
  prompt: chatPrompt,
  memory: bufferWindowMemory,
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

  async queryAll(question: string, history: string, context: string) {
    return await chain.call({
      input: question,
      context,
      history,
      immediate_history: bufferWindowMemory,
    });
  }

  async queryOpenAI(query: string) {
    // Wait 3 seconds before running
    await this.delay(8000);
    return await chain.call({
      input: query,
      context: '',
      history: '',
      immediate_history: bufferWindowMemory,
    });
  }

  delay = (delayInms: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

  async summarizeEarningsTranscript(transcript: string) {
    console.log('Summarizing Earnings Call Transcript...');

    // Prompt Primer
    var primer =
      'Can you provide a comprehensive summary of the given Earnings Call Transcript?' +
      ' The summary should cover all the key points and main ideas presented in the original text,' +
      ' while also condensing the information into a concise and easy-to-understand format.' +
      ' Please ensure that the summary includes relevant details and examples that support the main ideas,' +
      ' while avoiding any unnecessary information or repetition.' +
      ' The length of the summary should be appropriate for the length and complexity of the original text,' +
      ' providing a clear and accurate overview without omitting any important information.';

    var primed = await this.queryOpenAI(primer);
    var combinedSummaries = '';

    if (transcript.length > maxCharactors) {
      // split line into multiple even sections
      var splitSummaries: string[] = [];
      var stringChunks = splitStringByCharacterLimitAndFullStop(transcript, maxCharactors);

      for (var x = 0; x < stringChunks.length; x++) {
        const response = await this.queryOpenAI(stringChunks[x]);
        splitSummaries.push(response.text);
      }

      splitSummaries.forEach((split) => {
        combinedSummaries = combinedSummaries + split + '\n';
      });
    }

    return combinedSummaries;
  }


  async summarizeText(textList: string[]) {
    console.log("Summarizing an entire text file line by line...")

      var lineSummaries: string[] = []

      // Prompt Primer
      var primer = "Can you provide a comprehensive summary of the given text?" +
      " The summary should cover all the key points and main ideas presented in the original text," + 
      " while also condensing the information into a concise and easy-to-understand format." + 
      " Please ensure that the summary includes relevant details and examples that support the main ideas," + 
      " while avoiding any unnecessary information or repetition." + 
      " The length of the summary should be appropriate for the length and complexity of the original text," + 
      " providing a clear and accurate overview without omitting any important information."

      var primed = await this.queryOpenAI(primer)
      //console.log("GPT has been primed: " + primed)
      
      var maxCharactors = 15000

      for(var i = 0; i < textList.length; i++) {

        if (textList[i].length > maxCharactors) {

          var splitPrimer = "Before you create your summary you need to accept two inputs. Once the 2nd input is accepted, Do your thing"
          var splitPrimed = await this.queryOpenAI(splitPrimer)

          var splitSummaries: string[] = []
          var stringChunks = splitStringByCharacterLimitAndFullStop(textList[i], maxCharactors)

          for(var x = 0; x < stringChunks.length; x++) {
            const response = await this.queryOpenAI(stringChunks[x])
            splitSummaries.push(response.text)
          }

          var combinedSummaries = ""
          splitSummaries.forEach(split => {
            combinedSummaries = combinedSummaries + split + "\n"
          })

          lineSummaries.push(combinedSummaries)

        } else {
          const response = await this.queryOpenAI(textList[i])
          console.log("line " + i + " completed");
          lineSummaries.push(response.text)
        }
      } 

      return lineSummaries
  }
}