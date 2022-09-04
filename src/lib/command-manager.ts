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
  try {
    await rest.put(getApplicationCommandsRoute(), {
      body: Array.from(
        commandMap.mapValues((command) => command.data.toJSON()).values()
      ),
    });
    log(`Successfully registered ${commandMap.size} application commands.`);
  } catch (e) {
    log("Error registering commands:");
    log(e);
  }

  return commandMap;
};

export const removeOldCommands = async () => {
  const existingCommands = (await rest.get(
    getApplicationCommandsRoute()
  )) as APIApplicationCommand[];
  const currentCommands = Array.from(commandMap.keys());
  try {
    for (const command of existingCommands) {
      if (currentCommands.includes(command.name)) {
        return;
      }

      log(`Deleting old command: ${command.name}`);
      try {
        await rest.delete(getApplicationCommandRoute(command.id));
      } catch (e) {
        log(`Error deleting old command: ${command.name}`);
        log(e);
      }
    }
  } catch (e) {
    log("Error deleting old command:");
    log(e);
  }
};
