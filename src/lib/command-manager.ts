import * as fs from "fs";
import * as path from "path";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes, APIApplicationCommand } from "discord-api-types/v9";
import { Collection, CommandInteraction, Snowflake } from "discord.js";
import * as Config from "../config";

interface ICommand {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

const rest = new REST({ version: "9" }).setToken(Config.token);

const commandsDir = path.resolve(__dirname, "../bot/commands");
const commands = new Collection<string, ICommand>();

fs.readdirSync(commandsDir).forEach((file: string) => {
  const command = require(`${commandsDir}/${file}`);
  commands.set(command.data.name, command);
});

export const getCommand = (key: string) => commands.get(key);

const getApplicationCommandsRoute = () =>
  Config.isProduction
    ? Routes.applicationCommands(Config.applicationId)
    : Routes.applicationGuildCommands(Config.clientId, Config.guildId);

const getApplicationCommandRoute = (commandId: Snowflake) =>
  Config.isProduction
    ? Routes.applicationCommand(Config.applicationId, commandId)
    : Routes.applicationGuildCommand(
        Config.applicationId,
        Config.guildId,
        commandId
      );

export const registerCommands = async () => {
  try {
    await rest.put(getApplicationCommandsRoute(), {
      body: Array.from(
        commands.mapValues((command) => command.data.toJSON()).values()
      ),
    });
    console.log(
      `Successfully registered ${commands.size} application commands.`
    );
  } catch (e) {
    console.error("Error registering commands:");
    console.error(e);
  }

  return commands;
};

export const removeOldCommands = async () => {
  const existingCommands = (await rest.get(
    getApplicationCommandsRoute()
  )) as APIApplicationCommand[];
  const currentCommands = Array.from(commands.keys());
  try {
    for (const command of existingCommands) {
      if (currentCommands.includes(command.name)) {
        return;
      }

      console.log(`Deleting old command ${command.name}`);
      try {
        await rest.delete(getApplicationCommandRoute(command.id));
      } catch (e) {
        console.error(`Error deleting old command ${command.name}`);
        console.error(e);
      }
    }
  } catch (e) {
    console.error("Error deleting old command:");
    console.error(e);
  }
};
