import * as fs from "fs";
import * as path from "path";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes, APIApplicationCommand } from "discord-api-types/v9";
import { Collection, CommandInteraction } from "discord.js";
import { clientId, guildId, token } from "./config";

interface ICommand {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

const commandsDir = path.join(__dirname, "./commands");
const commands = new Collection<string, ICommand>();

export const registerCommands = async () => {
  fs.readdirSync(commandsDir).forEach((file: string) => {
    const command = require(`${commandsDir}/${file}`);
    commands.set(command.data.name, command);
  });

  const rest = new REST({ version: "9" }).setToken(token);
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: Array.from(
        commands.mapValues((command) => command.data.toJSON()).values()
      ),
    });
    console.log("Successfully registered application commands.");
  } catch (e) {
    console.error("Error registering commands:");
    console.error(e);
  }

  return commands;
};

// TODO: Delete non-existing commands
export const removeOldCommands = async () => {
  const rest = new REST({ version: "9" }).setToken(token);
  const existingCommands = (await rest.get(
    Routes.applicationGuildCommands(clientId, guildId)
  )) as APIApplicationCommand[];
  const currentCommands = fs
    .readdirSync(commandsDir)
    .map((file: string) => require(`${commandsDir}/${file}`).data.name);
  try {
    for (const command of existingCommands) {
      if (currentCommands.includes(command.name)) {
        return;
      }

      console.warn(`Deleting old command ${command.name}`);
      const result = await rest.delete(
        Routes.applicationGuildCommand(clientId, guildId, command.id)
      );

      console.log(result);
    }
  } catch (e) {
    console.error("Error deleting old command:");
    console.error(e);
  }
};
