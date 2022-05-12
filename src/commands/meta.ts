import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { directors, movies } from "../owen-wilson-api";

export const data = new SlashCommandBuilder()
  .setName("meta")
  .setDescription("Retrieve meta data to be used in commands.")
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("movies")
      .setDescription(
        "Retrieve all names of movies in which Owen Wilson says wow."
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("directors")
      .setDescription(
        "Retrieve all directors of movies in which Owen Wilson says wow."
      )
  );

export const execute = async (interaction: CommandInteraction) => {
  await interaction.deferReply();

  switch (interaction.options.getSubcommand()) {
    case "movies": {
      const list = (await movies()).join(",\n");
      interaction.editReply(`Owen Wilson says wow in these movies:\n${list}`);
      return;
    }
    case "directors": {
      const list = (await directors()).join(",\n");
      interaction.editReply(
        `Owen Wilson says wow with these directors:\n${list}`
      );
      return;
    }
    default: {
      interaction.editReply(`Unknown subcommand`);
    }
  }
};
