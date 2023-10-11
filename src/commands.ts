import chalk from 'chalk';
import helpCommand from './models/commands/helpCommand.js';
import earningsCallTranscriptCommand from './models/commands/earningsCallTranscriptCommand.js';
import financialReportsCommand from './models/commands/financialReportsCommand.js';
import financialDataCommand from './models/commands/financialDataCommand.js';
import newsStoriesCommand from './models/commands/newsStoriesCommand.js';
import downloadAllCommand from './models/commands/downloadAllCommand.js';
import pressReleasesCommand from './models/commands/pressReleasesCommand.js';
import generateReportCommand from './models/commands/generateReportCommand.js';

function createCommandHandler(): CommandHandler {
  const commands: Command[] = [
    helpCommand,
    earningsCallTranscriptCommand,
    financialReportsCommand,
    financialDataCommand,
    newsStoriesCommand,
    pressReleasesCommand,
    downloadAllCommand,
    generateReportCommand,
  ];

  function getCommands() {
    return commands;
  }

  const commandHandler: CommandHandler = {
    getCommands,
    async execute(commandName: string, args: string[], output: NodeJS.WriteStream) {
      const command = commands.find((cmd) => cmd.name === commandName || cmd.aliases.includes(commandName));
      if (command) {
        await command.execute(args, output, commandHandler);
      } else {
        output.write(chalk.red('Unknown command. Type /help to see the list of available commands.\n'));
      }
    },
  };
  return commandHandler;
}

export default createCommandHandler;
