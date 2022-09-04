import {
  SlashCommandIntegerOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import * as WowPI from "../../../../owen-wilson-api";

export const data = new SlashCommandSubcommandBuilder()
  .setName("ordered")
  .setDescription("Says a specific wow!")
  .addIntegerOption(
    new SlashCommandIntegerOption()
      .setName("index")
      .setDescription("The wow number to play")
      .setMinValue(0)
      .setMaxValue(90)
      .setRequired(true)
  );

export const execute = async (
  interaction: CommandInteraction
): Promise<WowPI.IWowResponse[]> => {
  const index = interaction.options.getInteger("index", true);
  return WowPI.ordered({ index });
};
