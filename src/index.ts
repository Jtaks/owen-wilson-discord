/**
 * The client that listens for requests from discord.
 */

import { Client, Intents } from "discord.js";
import { token } from "./config";
import { registerCommands } from "./register-commands";

const commands = registerCommands();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

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

client.login(token);
