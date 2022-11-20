import { REST } from "@discordjs/rest";
import { APIApplicationCommand, Routes } from "discord-api-types/v9";
import { Collection, Snowflake } from "discord.js";
import * as commands from "../bot/commands";
import { ICommand } from "../bot/commands/types";
import * as Config from "../config";
import { log } from "./logger";

const rest = new REST({ version: "9" }).setToken(Config.token);

const commandMap = new Collection<string, ICommand>();
Object.values(commands).forEach((command) => {
  commandMap.set(command.data.name, command);
});

export const getCommand = (key: string) => commandMap.get(key);

const getApplicationCommandsRoute = () =>
  Config.isProduction()
    ? Routes.applicationCommands(Config.applicationId)
    : Routes.applicationGuildCommands(Config.clientId, Config.guildId);

const getApplicationCommandRoute = (commandId: Snowflake) =>
  Config.isProduction()
    ? Routes.applicationCommand(Config.applicationId, commandId)
    : Routes.applicationGuildCommand(
        Config.applicationId,
        Config.guildId,
        commandId
      );

export const registerCommands = async () => {
  const commandType = Config.isProduction() ? "application" : "guild";

  try {
    await rest.put(getApplicationCommandsRoute(), {
      body: Array.from(
        commandMap.mapValues((command) => command.data.toJSON()).values()
      ),
    });
    log(`Successfully registered ${commandMap.size} ${commandType} commands.`);
  } catch (e) {
    log(`Error registering ${commandType} commands:`);
    log(e);
  }

  return commandMap;
};

export const removeOldApplicationCommands = async () => {
  const commandType = Config.isProduction() ? "application" : "guild";
  let existingCommands: APIApplicationCommand[];

  try {
    existingCommands = (await rest.get(
      getApplicationCommandsRoute()
    )) as APIApplicationCommand[];
  } catch (e) {
    log(`Error retrieving existing ${commandType} commands:`);
    log(e);
    return;
  }

  const currentCommands = Array.from(commandMap.keys());

  for (const command of existingCommands) {
    if (currentCommands.includes(command.name)) {
      return;
    }

    log(`Deleting old ${commandType} command ${command.name}:`);
    try {
      await rest.delete(getApplicationCommandRoute(command.id));
    } catch (e) {
      log(`Error deleting old ${commandType} command ${command.name}:`);
      log(e);
    }
  }
};

export const removeApplicationGuildCommands = async () => {
  let existingCommands: APIApplicationCommand[];

  try {
    existingCommands = (await rest.get(
      Routes.applicationGuildCommands(Config.clientId, Config.guildId)
    )) as APIApplicationCommand[];
  } catch (e) {
    log("Error retrieving existing guild commands");
    log(e);
    return;
  }

  for (const command of existingCommands) {
    log(`Deleting guild command: ${command.name}`);
    try {
      await rest.delete(getApplicationCommandRoute(command.id));
    } catch (e) {
      log(`Error deleting guild command: ${command.name}`);
      log(e);
    }
  }
};
