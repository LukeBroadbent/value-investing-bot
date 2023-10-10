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
  modelName: 'gpt-4',
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

export default class ValueBotService {
  private static _instance: ValueBotService = new ValueBotService();

  constructor() {
    if (ValueBotService._instance) {
      throw new Error('Error: Instantiation failed: Use ValueBotService.getInstance() instead of new.');
    }
    ValueBotService._instance = this;
  }

  public static getInstance(): ValueBotService {
    return ValueBotService._instance;
  }

  async queryAll(question: string, history: string, context: string) {
    return await chain.call({
      input: question,
      context,
      history,
      immediate_history: bufferWindowMemory,
    });
  }
}
