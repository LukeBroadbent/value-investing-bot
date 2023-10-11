import dotenv from 'dotenv';
dotenv.config();

import chalk from 'chalk';
import { ask } from 'stdio';
import { stdout as output } from 'process';
import ShortTermMemoryService from './services/ShortTermMemoryService.js';
import sanitizeInput from './utils.js';
import LongTermMemoryService from './services/LongTermMemoryService.js';
import createCommandHandler from './commands.js';
import ValueBotService from './services/ValueBotService.js';

// Set up CLI commands
const commandHandler: CommandHandler = createCommandHandler();

//LongTermMemoryService.getInstance().deleteCollection()


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
      response = await ValueBotService.getInstance().queryAll(question, history, context);
      if (response) {
        await ShortTermMemoryService.getInstance().addDocumentsToMemoryVectorStore([
          { content: question, metadataType: 'question' },
          { content: response?.text, metadataType: 'answer' },
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
