import { Client, Intents } from "discord.js";
import * as Config from "../config";
import {
  getCommand,
  registerCommands,
  removeOldApplicationCommands,
} from "../lib/command-manager";
import { debug, log } from "../lib/logger";

const mode = Config.isProduction() ? "production" : "development";

const initializeDiscordClient = async () => {
  log(`Running in ${mode} mode.`);

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
  });

  process.on("SIGINT", () => {
    client.destroy();
    process.exit(0);
  });

  client.once("ready", () => {
    log("Ready!");
    process?.send?.("ready");
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
      debug(
        `Received something that was not a command:\n${JSON.stringify(
          interaction.toJSON()
        )}`
      );
      return;
    }

    const command = getCommand(interaction.commandName);

    if (!command) {
      debug(`Received unknown command: ${interaction.commandName}`);
      return;
    }

    try {
      debug(`Executing command: ${interaction.commandName}`);
      await command.execute(interaction);
    } catch (error) {
      log(error);
      const response = {
        content: "Wow! Something went wrong.",
        ephemeral: true,
      };

      if (interaction.deferred) {
        interaction.editReply(response);
      } else {
        interaction.reply(response);
      }
    }
  });

  client.login(Config.token);
};

initializeDiscordClient();
removeOldApplicationCommands();
registerCommands();
