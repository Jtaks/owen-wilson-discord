import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getDirectors } from "../../../../../owen-wilson-api";

export const data = new SlashCommandSubcommandBuilder()
  .setName("directors")
  .setDescription(
    "Retrieve all directors of movies in which Owen Wilson says wow."
  );

export const execute = async (interaction: CommandInteraction) => {
  const directors = await getDirectors();
  const list = directors.join(",\n");
  interaction.editReply(`Owen Wilson says wow with these directors:\n${list}`);
};
