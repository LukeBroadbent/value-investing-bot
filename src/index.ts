import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import chalk from 'chalk';

import { ask, readLine } from 'stdio';
//import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process';

import ShortTermMemoryService from './services/ShortTermMemoryService.js';
import sanitizeInput from './utils.js';
import { oneLine } from 'common-tags';
import path from 'path';
import { fileURLToPath } from 'url';

// Langchain Imports
import { LLMChain } from 'langchain/chains';
import { OpenAIChat } from 'langchain/llms/openai';
import { CallbackManager } from 'langchain/callbacks';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import { BufferWindowMemory } from 'langchain/memory';
import LongTermMemoryService from './services/LongTermMemoryService.js';
import createCommandHandler from './commands.js';
import OpenAIService from './services/OpenAIService.js';

// Set up the readline interface to read input from the user and write output to the console
//const rl = readline.createInterface({ input, output })

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

console.log(path.dirname(currentModulePath));
const projectRootDir = path.resolve(path.dirname(currentModulePath), '..');
console.log(projectRootDir);

// Get the prompt template
const systemPromptTemplate = fs.readFileSync(path.join(projectRootDir, 'src/prompt.txt'), 'utf8');

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

// Set up CLI commands
const commandHandler: CommandHandler = createCommandHandler();

// LongTermMemoryService.getInstance().deleteCollection()
//LongTermMemoryService.getInstance().addDocumentsToLongTermMemory()

while (true) {
  const userInput = await ask(chalk.green('\nStart chatting or type /help for a list of commands\n'));
  var response;

  if (userInput.startsWith('/')) {
    const [command, ...args] = userInput.slice(1).split(' ');
    await commandHandler.execute(command, args, output);
  } else {
    const question = sanitizeInput(userInput);
    const history = await ShortTermMemoryService.getInstance().queryShortTermMemory(question);
    const context = await LongTermMemoryService.getInstance().queryLongTermMemory(question);
    try {
      response = await OpenAIService.getInstance().queryAll(question, history, context);
      if (response) {
        await ShortTermMemoryService.getInstance().addDocumentsToMemoryVectorStore([
          { content: question, metadataType: 'question' },
          { content: response.text, metadataType: 'answer' },
        ]);
        //await logChat(chatLogDirectory, question, response.response);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cancel:')) {
      } else if (error instanceof Error) {
        output.write(chalk.red(error.message));
      } else {
        output.write(chalk.red(error));
      }
    }
  }

  output.write('\n');
}
