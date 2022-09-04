import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { directorsSubCommand, moviesSubCommand } from "./subcommands";

export const data = new SlashCommandBuilder()
  .setName("meta")
  .setDescription("Retrieve meta data to be used in commands.");

data.addSubcommand(moviesSubCommand.data);
data.addSubcommand(directorsSubCommand.data);

export const execute = async (interaction: CommandInteraction) => {
  await interaction.deferReply();

  switch (interaction.options.getSubcommand()) {
    case directorsSubCommand.data.name: {
      directorsSubCommand.execute(interaction);
      return;
    }
    case moviesSubCommand.data.name: {
      moviesSubCommand.execute(interaction);
      return;
    }
    default: {
      interaction.editReply(`Unknown subcommand`);
    }
  }
};
