import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { movies } from "../../../../owen-wilson-api";

export const data = new SlashCommandSubcommandBuilder()
  .setName("movies")
  .setDescription(
    "Retrieve all names of movies in which Owen Wilson says wow."
  );

export const execute = async (interaction: CommandInteraction) => {
  const response = await movies();
  const list = response.join(",\n");
  interaction.editReply(`Owen Wilson says wow in these movies:\n${list}`);
};
