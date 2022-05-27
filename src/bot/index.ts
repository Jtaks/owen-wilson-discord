import { Client, Intents } from "discord.js";
import * as Config from "../config";
import {
  getCommand,
  registerCommands,
  removeOldCommands,
} from "../lib/command-manager";

const initializeDiscordClient = async () => {
  console.log(
    `Running in ${Config.isProduction ? "production" : "development"} mode`
  );

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
  });

  client.once("ready", () => {
    console.log("Ready!");
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = getCommand(interaction.commandName);

    if (!command) {
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const response = {
        content: "There was an error while executing this command!",
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
removeOldCommands();
registerCommands();
