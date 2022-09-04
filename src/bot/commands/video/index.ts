import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import * as WowPI from "../../owen-wilson-api";

export const data = new SlashCommandBuilder()
  .setName("video")
  .setDescription("Replies with a random wow video!");

export const execute = async (interaction: CommandInteraction) => {
  await interaction.deferReply();
  const [wow] = await WowPI.random();
  interaction.editReply(wow.video["720p"]);
};
