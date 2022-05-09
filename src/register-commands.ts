import * as fs from "fs";
import * as path from "path";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Collection, CommandInteraction } from "discord.js";
import { clientId, guildId, token } from "./config";

interface ICommand {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

const commandsDir = path.join(__dirname, "./commands");

const commands = new Collection<string, ICommand>();

export const registerCommands = () => {
  fs.readdirSync(commandsDir).forEach((file: string) => {
    const command = require(`${commandsDir}/${file}`);
    commands.set(command.data.name, command);
  });

  const rest = new REST({ version: "9" }).setToken(token);
  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), {
      body: Array.from(
        commands.mapValues((command) => command.data.toJSON()).values()
      ),
    })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);

  return commands;
};
