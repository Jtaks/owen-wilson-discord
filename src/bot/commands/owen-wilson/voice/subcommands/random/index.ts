import {
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import * as WowPI from "../../../../../owen-wilson-api";

export const data = new SlashCommandSubcommandBuilder()
  .setName("random")
  .setDescription("Says a random wow!")
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("results")
      .setDescription("Picks a specific number of random wows.")
      .setMinValue(1)
      .setMaxValue(10)
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("year")
      .setDescription("Picks a random wow from a specific year.")
      .setMinValue(0)
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("movie")
      .setDescription(
        "Picks a random wow by the name of the movie it appears in."
      )
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("director")
      .setDescription(
        "Picks a random wow from a movie with a particular director."
      )
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("wows_in_movie")
      .setDescription(
        "Picks a random wow by the number of its occurrence in a movie."
      )
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("sort")
      .setDescription("Sort multiple random results.")
      .addChoices(
        { name: WowPI.WowSort.movie, value: WowPI.WowSort.movie },
        {
          name: WowPI.WowSort.release_date,
          value: WowPI.WowSort.release_date,
        },
        { name: WowPI.WowSort.year, value: WowPI.WowSort.year },
        { name: WowPI.WowSort.director, value: WowPI.WowSort.director },
        {
          name: WowPI.WowSort.number_current_wow,
          value: WowPI.WowSort.number_current_wow,
        }
      )
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("direction")
      .setDescription("Sort direction can be either ascending or descending.")
      .addChoices(
        { name: WowPI.WowDirection.asc, value: WowPI.WowDirection.asc },
        { name: WowPI.WowDirection.desc, value: WowPI.WowDirection.desc }
      )
  );

const getSort = (interaction: CommandInteraction) => {
  const option = interaction.options.getString("sort") as WowPI.WowSort | null;
  const sort = option ?? WowPI.WowSort.movie;

  return WowPI.WowSort[sort];
};

const getDirection = (interaction: CommandInteraction) => {
  const option = interaction.options.getString(
    "direction"
  ) as WowPI.WowDirection | null;
  const direction = option ?? WowPI.WowDirection.asc;

  return WowPI.WowDirection[direction];
};

export const execute = async (
  interaction: CommandInteraction
): Promise<WowPI.IWowResponse[]> => {
  const results = interaction.options.getNumber("results");
  const year = interaction.options.getNumber("year");
  const movie = interaction.options.getString("movie");
  const director = interaction.options.getString("director");
  const wowsInMovie = interaction.options.getString("wows_in_movie");
  const sort = getSort(interaction);
  const direction = getDirection(interaction);

  return WowPI.random({
    results,
    year,
    movie,
    director,
    wowsInMovie,
    sort,
    direction,
  });
};
